---
title: "NAPI on Linux"
date: 2021-03-06T01:37:04+08:00
draft: false
authors:
  - younjinjeong
tags: [linux, networking, interrupts]
---


이제는 오래되어 버린 기술이지만, 2006년 경의 2.6.1x 대 커널에서의 NAPI 사용으로 인한 시스템 부하 절감 및 네트워킹 성능 향상은 경이로운 것이었다.  무지막지한 인터럽트 증가로 인하여 static 파일을 서비스 하는 웹 서버가 죽을똥 살똥 하던 모습이란.

언젠가 한번은 적어야지 했는데, 마치 Memory Hole 관련 문제처럼 언젠가는 잊어버리지 않을까 싶어, 생각 난 김에 포스팅 한다.
오랜만에 보는 HOW-To 문서를 번역할 예정이며, 요새 커널 버전과는 매우 동떨어져 있지만.. 뭐 그래도 잘 설명 되었으니까. 문서 원본은 아래의 링크에서 참조 할수있다.

http://www.cookinglinux.org/pub/netdev_docs/napi-howto.php3.html


## NAPI 소개

NAPI는 리눅스 머신의 네트워크 성능 향상을 이끌어내는 검증받은 기술이다. 보다 디테일한 정보는 다음의 링크에서 찾아 볼 수 있다.  http://www.cyberus.ca/~hadi/usenix-paper.tgz

이 기술은 아래의 Robert 의 기가비트 이더넷 (e1000) 을 통해 수집된 표에 나타난 시스템 성능상의 문제를 완화시키는 작용을 한다.

 | Psize  |  Ipps   |    Tput  |   Rxint  |   Txint  |  Done  |   Ndone |
 | ---------|:--------:|:--------:|:-------:|:---------:|---------:|--------|
|   60  |  890000  |   409362    |    17  |   27622   |     7  |   6823 |
|  128 | 758150| 464364  |  21  | 9301  | 10 | 7738 |
| 256  | 445632  | 774646  | 42 | 15507 |  21  |  12906 |
| 512  | 232666  | 994445  | 241292  | 19147 | 241192 | 1062 |
| 1024 | 119061  | 1000003 | 872519  | 19258 | 872511 |   0  |
| 1440 | 85193   | 1000003 | 946576  | 19505 | 946569 |   0  |


* "Ipps" - 초당 패킷 유입량
* "Tput" - 1M 를 전송하는데 사용된 패킷의 총 갯수 packets out of total 1M that made it out
* "txint" -   전송을 완료하는데 필요한 시스템 인터럽트 카운트
* "Done" -  rx ring 에서 모든 패킷이 전송되는동안 poll() 시스템 함수가 호출된 횟수.( Note from this that the lower the load the more we could clean up the rxring )
* "Ndone" -  "Done" 의 반대 개념. 

( Note again, that the higher the load the more times we couldn't clean up the rxring )

NIC가 890Kpackets/sec 을 수신할때 인터럽트는 단지 17회만 발생하게 된다. 시스템은 이와같은 부하 상황에서 1 인터럽트/패킷 을 처리 할 수 없다.  
반면, rx 인터럽트가 증가하면  인터럽트/패킷의 비율이 함께 증가하는것을 볼수있다. (표 참조) 

따라서, 적당히 낮은 양의 패킷이 유입되는 상황에서는, 1 개의 패킷을 처리하기 위해 1회의 인터럽트가 필요할수 있으며, 만약 시스템이 이를 처리할 수 없는 인터럽트의 양에 도달하게 되면, 그때부터 시스템은 뻗기 시작할
것이다.

__NOTE__: (역자 주. 표를 그냥 vmstat 로 표시했으면 편할껀데... 어쨌든 위와 같이 인터럽트가 허용 범위 이상에 도달하는 상황은 예전 NForce Chipset 에 포함되어 나온 NIC 드라이버 문제 외에  광케이블을 크로스로 2대를 연결하여 네트워크 시뮬레이션 해 보면 알 수 있다. NAPI가 적용되지 않은 드라이버의 경우, 인터럽트가 20만회 이상을
육박하며 , 시스템이 퍼지는 현상을 쉽게 목격 할 수 있다.  당연히 시스템의 인터럽트 능력은 CPU 및 해당 NIC 인터페이스와 관계 되므로, 한계 성능은 시스템에 따라 다르게 나타 날 수 있다. 아무튼, 이와 같은 현상에 대한 수치적 증거로서 위의 표를 이해 하면 되겠다.)  


## 전제 조건

NAPI 변경으로 인한 잇점이 아난 네트워크 스택을 제어하기 위해 2.4 커널을 사용 할 수도 있다. (본 문서가 마지막으로 수정된건 2002년 4월) NAPI 추가 기능은 커널 하위 호환성을 해치지는 않지만, 다음과 같은 feature를 사용 가능하게끔 해주어야 동작한다.

- 소프트웨어 디바이스에 패킷을 저장하기 위한 DMA ring 또는 충분한 RAM 크기
- 인터럽트를 끌 수 있는 기능 또는 스택에 패킷을 넣을 수 있는 이벤트.

NAPI는 패킷 이벤트를 dev->poll() 메서드를 통해 처리한다. tulip 드라이버의 인터럽트처리를 dev->poll() 로 변경한 드라이버를 사용한 테스트에서는 약간의 지연이 나타났으며, MII 드라이버에서는 조금 더 심했다.

예제들은 본문서에 사용하기위해 제작된 것이며, 인터럽트 핸들러를 dev->poll()로 변경했다. 아래의 포팅된 e1000 코드를 참조하기 바란다.

여기서 소개한 방법에는 서로 다른 기종의 NIC 들은 각각 다른 status/event 설정이 적용될 수 있는 문제가 있을 수 있음을 알아두자.

아래와 같은 두가지의 서로 다른 ACK 이벤트 처리 매카니즘이 존재한다.

I )  Clear-on-read (COR) 로 알려진 매카니즘.  status/event 레지스터를 읽는 순간 모두 비워버리는 형태. natsemi 와 sunbmac NIC가 이 동작으로 유명하며, 이와같은 경우 모든걸 dev->poll() 로 변경해야 함.

II)  Clear-on-write ( COW )
    
A. bit-location 에 1을 write 할때 status 가 지워지는 형태. NAPI와 가장 잘 맞는 형태이며, 많은 벤더의 NIC를 지원. 수신 이벤트 ( receive event ) 에 대해서만 dev-poll() 처리. 나머지는 기존의 인터럽트 핸들러로 처리.

B. 무엇을 쓰던 write 액션이 발생하면 status 레지스터를 비우는 형태.  이와 같은 형태로 동작하는 리눅스 드라이버는 보이지 않음.
    
III) 새로운 work 를 정확하게 감지 할 수 있는 능력.


NAPI 는 처리할 work 가 있는 상태에 shutdown 되며, 처리할 work 가 없는 상태에서 켜지게 된다.

작은 윈도우 사이즈의 새로운 패킷이 인터럽트가 재가동 되는 순간 유입된다면, 이 패킷은 인터럽트가 활성화 되는 순간 유실 될 수 있다. 따라서 이와 같이 새로 유입된 패킷은 다음번 인터럽트때 처리될 수 있도록 분류 되어야한다. 

정리하면, 이와 같은 패킷은 경쟁상태((역주: 시스템이 하나의 자원에 한개 이상의 프로세스가 몰린 상태, 그냥 busy 상태의 시스템에서는 "rotting packet" ( 쓸 수 없는 패킷 ) 으로 처리 되어야 한다.

이는 매우 중요한 프로세스이며, appendix 2 에서 추가적으로 논의 된다.

Locking룰 과 환경에 대한 보장.

 - Guarantee :  반드시 단 1개의 CPU가 dev->poll() 호출이 가능해야 한다.
 - 코어 레이어에서는 패킷을 보내기 위한 디바이스 호출에 round robin 포멧을 사용해야 한다.
 - contention 은 다른 CPU의 rx ring 엑세스의 결과로만 되어야 한다. ( 뭔가 번역 이상 @_@ )
    이는 close() 및 suspend() 호출시에만 발생한다. ( rx ring을 비우고자 할때 )
 ***** guarantee : 이는 net의 최상위 레벨에서 구현 되기 때문에 드라이버 개발자는 신경쓸 필요가 없다.

 - local interrupts 활성화 ( dev->poll() 로 처리하고 싶지 않은 경우 )
    예를 들면, link/MII , txcomplete 는 옛날 방식으로 동작한다.

 본 문서의 이후로 부터는, dev->poll() 이 수신 이벤트를 위한 단 하나의 프로세스라고 가정한다.


NAPI 에서 제공하는 새로운 메서드

  A. netif_rx_schedule(dev) : 
      디바이스 poll  스케줄을 위한 IRQ 핸들러

  B. netif_rx_schedule_prep(dev) : 
      CPU 폴링리스트가 가용한 상태라면 여기에 장치 상태를 넣기 위해 사용된다.

  C. __netif_rx_schedule(dev) : 
      CPU의 폴 리스트에 넣기 위해 사용된다.  _prep 가 이미 호출 되었고 1을 리턴 했음을 가정한다.

  D. netif_rx_reschedule(dev, undo) : 
      이미 호출된 장치 이외의 다른 장치를 폴링하기 위해 사용된다.  자세한 내용은 Appendix 2 를 참조한다.

  E. netif_rx_complete(dev) :
      CPU poll 리스트에서 장치를 제거한다. 이는 반드시 현재 cpu 의 poll list 여야 한다.이는 모든 작업이 완료 되었을때, dev->poll() 를 호출한다. 


위에 기술된 내용은 아래에 반영되어 있다.


## NAPI를 사용하게끔 포팅할때 변경되는 디바이스 드라이버의 내용

NAPI동작을 위해서는 아래의 내용이 변경될 필요가 있다.


1. dev->poll() 메서드의 소개

    새로운 패킷이 수신되었을때 네트워크 코어에서 드라이버로 호출하는 메서드다.
    드라이버는 네트워크 서브 시스템의 하위 유연성을 위해 수신된 패킷을 CPU에 의해 dev->quota로 패킷을 보낼수 있다. (따라서 다른 장치들이 stack 에 접근 할 수 있다.)

    dev->poll() 프로토타입은 다음과 같다.

    ~~~c
    int my_poll(struct net_device *dev, int *budget)
    ~~~

    budget 은 네트워크 서브시스템에 남아있는 패킷의 수량을 나타낸다.
    *각 드라이버는 보내진 패킷 만큼 감소된 카운트를 변경해 주어야 한다.
    패킷의 총 수량은 dev->quota 보다 같거나 커질 수 없다.

    dev->poll() 메서드는 시스템의 가장 높은 레벨에서 호출되며, 드라이버는 요청된 양의 패킷을 스택으로 보낼수 있다. 인터럽트 이후의 dev->poll() 에 관한 상세 내용은 아래에 기술된다.


2. registering dev->poll() method
   
    dev->poll should be set in the dev->probe() method. 

    e.g:

    ```c
    dev->open = my_open;
    ...
    /* two new additions */
    /* first register my poll method */
    
    dev->poll = my_poll;
    
    /* next register my weight/quanta; can be overriden in /proc */
    
    dev->weight = 16;
    ...
    dev->stop = my_close;
    ```

3. dev->poll() 의 스케쥴링
    이 예제는 인터럽트 핸들러에 수정을 가하였으며, NIC에서 패킷을 꺼내 스택으로 보내는 동작을 보여준다.
   
    전통적인 B Becker 인터럽트 프로세서의 동작이 함께 소개되기 때문에 주요하다.

    ```c++
    static void
    
    netdevice_interrupt(int irq, void *dev_id, struct pt_regs *regs) {
    
    	struct net_device *dev = (struct net_device *)dev_instance;
    	struct my_private *tp = (struct my_private *)dev->priv;
    
    
    	int work_count = my_work_count;
            status = read_interrupt_status_reg();
            if (status == 0)
                    return;         /* Shared IRQ: not us */
            if (status == 0xffff)
                    return;         /* Hot unplug */
            if (status & error)
    		do_some_error_handling()

    	do {
    		acknowledge_ints_ASAP();
    
    		if (status & link_interrupt) {
    			spin_lock(&tp->link_lock);
    			do_some_link_stat_stuff();
    			spin_lock(&tp->link_lock);
    		}
    
    		if (status & rx_interrupt) {
    			receive_packets(dev);
    		}
    
    		if (status & rx_nobufs) {
    			make_rx_buffs_avail();
    		}
    			
    		if (status & tx_related) {
    			spin_lock(&tp->lock);
    			tx_ring_free(dev);
    			if (tx_died)
    				restart_tx();

    			spin_unlock(&tp->lock)    
    		}

    		status = read_interrupt_status_reg();    
    
    	} while (!(status & error) || more_work_to_be_done);
    }
    ``` 
    

## NAPI 를 활성화

```c++
static void

netdevice_interrupt(int irq, void *dev_id, struct pt_regs *regs) {

	struct net_device *dev = (struct net_device *)dev_instance;
	struct my_private *tp = (struct my_private *)dev->priv;

        status = read_interrupt_status_reg();

        if (status == 0)
                return;         /* Shared IRQ: not us */

        if (status == 0xffff)
                return;         /* Hot unplug */

        if (status & error)
		
    do_some_error_handling();

	do {

/************************ start note *********************************/		

		acknowledge_ints_ASAP();  // dont ack rx and rxnobuff here

/************************ end note *********************************/		


		if (status & link_interrupt) {
			spin_lock(&tp->link_lock);
			do_some_link_stat_stuff();
			spin_unlock(&tp->link_lock);
		}

/************************ start note *********************************/		

		if (status & rx_interrupt || (status & rx_nobuffs)) {
			if (netif_rx_schedule_prep(dev)) {

				/* disable interrupts caused 
			         *	by arriving packets */

				disable_rx_and_rxnobuff_ints();

				/* tell system we have work to be done. */

				__netif_rx_schedule(dev);

			} else {
				printk("driver bug! interrupt while in poll\n");

				/* FIX by disabling interrupts  */

				disable_rx_and_rxnobuff_ints();
			}

		}

/************************ end note note *********************************/		

		if (status & tx_related) {
			spin_lock(&tp->lock);
			tx_ring_free(dev);

			if (tx_died)
				restart_tx();

			spin_unlock(&tp->lock);
		}

		status = read_interrupt_status_reg();

/************************ start note *********************************/		

	} while (!(status & error) || more_work_to_be_done(status));

/************************ end note note *********************************/		

}
```



## 위 로 부터 몇가지 내용을 확인 할 수 있다.

1. 패킷의 수신으로 발생한 어떠한 인터럽트도 동작하지 않게끔 변경한다. .
     다음의 두가지 상태로 인해 하드웨어는 패킷이 수신되면 인터럽트를 유발한다. (NAPI 에서는 원하지 않는 동작)

     첫째는, 패킷이 수신되고 (rxint) , 둘째는  패킷이 도착 했으나 가용한 DMA 영역이 없음을 발견 (rxnobuff) 했을때 이다. 이는 위의 두가지 상황에 대해 acknowledge_ints_ASAP() 호출로 status 레지스터를 비울 수 없음을 의미한다.NAPI를 사용하는 경우에는 work 가 어느 단계에서든 적절히 종료되면 언제든 status 레지스터를 비울 수 있다.

     이에 관하여 poll() 및 refill_rx_ring() 은 아래에 논의 된다.
     netif_rx_schedule_prep() 는  장치가 폴링 리스트에 정상적으로 등록이 되고 동작 가능한 상태이면 1을 리턴한다.

     0이 리턴되는 경우는 장치가 이미 추가 되었거나, 장치가 동작하지 않는 경우 등으로 추정 할 수 있다.
    
     이러한 오류를 rx 와 rxnobuf 인터럽트를 비활성화 함으로서 미연에 방지 할 수 있게 된다.

2. receive_packets(dev) 와 make_rx_buffs_avail() 은 없어질 가능성이 있다. 아직은 존재하지만... (8년전 문서이기에 궁금하신 분은 최신 소스를 확인해 보시면 된다.

     >사실,  receive_packets(dev) 는 my_poll() 과 매우 비슷하며, make_rx_buffs_avail() 은 my_poll() 에서 호출한다.


4. receive_packets() 을 dev->poll() 로 변환

D Becker 의 전통적인 receive_packet(dev) 를 my_poll() 로 변환해 줄 필요가 있다.

일반적인 receive_packet() 을 보자.

~~~c++
/* this is called by interrupt handler */
static void receive_packets (struct net_device *dev) {

	struct my_private *tp = (struct my_private *)dev->priv;

	rx_ring = tp->rx_ring;
	cur_rx = tp->cur_rx;

	int entry = cur_rx % RX_RING_SIZE;
	int received = 0;
	int rx_work_limit = tp->dirty_rx + RX_RING_SIZE - tp->cur_rx;

	while (rx_ring_not_empty) {
		
    u32 rx_status;

		unsigned int rx_size;
		unsigned int pkt_size;
		struct sk_buff *skb;

    /* read size+status of next frame from DMA ring buffer */
    /* the number 16 and 4 are just examples */

    rx_status = le32_to_cpu (*(u32 *) (rx_ring + ring_offset));
    rx_size = rx_status >> 16;
    pkt_size = rx_size - 4;

		/* process errors */

    if ((rx_size > (MAX_ETH_FRAME_SIZE+4)) ||
        (!(rx_status & RxStatusOK))) {
            netdrv_rx_err (rx_status, dev, tp, ioaddr);
            return;
    }

    if (--rx_work_limit < 0)
      break;


    /* grab a skb */    

    skb = dev_alloc_skb (pkt_size + 2);

    if (skb) {
			netif_rx (skb);
    } else {  /* OOM */

      /*seems very driver specific ... some just pass
    	whatever is on the ring already. */
    }

		/* move to the next skb on the ring */

    entry = (++tp->cur_rx) % RX_RING_SIZE;
    received++ ;


  }


    /* store current ring pointer state */
    tp->cur_rx = cur_rx;

    /* Refill the Rx ring buffers if they are needed */
    
    refill_rx_ring();

}
~~~


----------------------------------------------
새로운 파라메터에 주의하며 아래의 변경된 코드를 참조한다. 
----------------------------------------------


~~~c++
/* this is called by the network core */
static void my_poll (struct net_device *dev, int *budget) {

	struct my_private *tp = (struct my_private *)dev->priv;

	rx_ring = tp->rx_ring;
	cur_rx = tp->cur_rx;

  int entry = cur_rx % RX_BUF_LEN;
	
  /* maximum packets to send to the stack */
  /************************ note note *********************************/		
  
  int rx_work_limit = dev->quota;

  /************************ end note note *********************************/		
  
  do {  // outer beggining loop starts here
	
    clear_rx_status_register_bit();
	
    while (rx_ring_not_empty) {

		u32 rx_status;
		unsigned int rx_size;
		unsigned int pkt_size;
		struct sk_buff *skb;

    /* read size+status of next frame from DMA ring buffer */
		/* the number 16 and 4 are just examples */

    rx_status = le32_to_cpu (*(u32 *) (rx_ring + ring_offset));
    
    rx_size = rx_status >> 16;
    pkt_size = rx_size - 4;

		/* process errors */

    if ((rx_size > (MAX_ETH_FRAME_SIZE+4)) ||
        (!(rx_status & RxStatusOK))) {
          netdrv_rx_err (rx_status, dev, tp, ioaddr);
          return;
    }

    /************************ note note *********************************/		

    if (--rx_work_limit < 0) { /* we got packets, but no quota */

			/* store current ring pointer state */
			tp->cur_rx = cur_rx;

			/* Refill the Rx ring buffers if they are needed */
			refill_rx_ring(dev);

      goto not_done;
		}

    /**********************  end note **********************************/


		/* grab a skb */

    skb = dev_alloc_skb (pkt_size + 2);
    
    if (skb) {

    /************************ note note *********************************/		

			netif_receive_skb (skb);

    /**********************  end note **********************************/


    } else {  /* OOM */

			/*seems very driver specific ... common is just pass
			whatever is on the ring already. */

    }    
	/* move to the next skb on the ring */
	  entry = (++tp->cur_rx) % RX_RING_SIZE;
		received++ ;
}
	/* store current ring pointer state */
        tp->cur_rx = cur_rx;

  /* Refill the Rx ring buffers if they are needed */
	refill_rx_ring(dev);

	/* no packets on ring; but new ones can arrive since we last 
    checked  */

	status = read_interrupt_status_reg();
	if (rx status is not set) {

    /* If something arrives in this narrow window,
    an interrupt will be generated */

    goto done;
	}

	/* done! at least thats what it looks like ;->
	if new packets came in after our last check on status bits
they'll be caught by the while check and we go back and clear them since we havent exceeded our quota */

  } while (rx_status_is_set); 

done:

/************************ note note *********************************/		

  dev->quota -= received;
  *budget -= received;

  /* If RX ring is not full we are out of memory. */

  if (tp->rx_buffers[tp->dirty_rx % RX_RING_SIZE].skb == NULL)
    goto oom;


	/* we are happy/done, no more packets on ring; put us back
	to where we can start processing interrupts again */

  netif_rx_complete(dev);
  enable_rx_and_rxnobuf_ints();


  /* The last op happens after poll completion. Which means the following:

  * 1. it can race with disabling irqs in irq handler (which are done to * schedule polls)

  * 2. it can race with dis/enabling irqs in other poll threads

  * 3. if an irq raised after the begining of the outer  beginning * loop(marked in the code above), it will be immediately
  * triggered here.

  *

  * Summarizing: the logic may results in some redundant irqs both

  * due to races in masking and due to too late acking of already

  * processed irqs. The good news: no events are ever lost.

  */
  return 0;   /* done */    


not_done:
  if (tp->cur_rx - tp->dirty_rx > RX_RING_SIZE/2 ||
    tp->rx_buffers[tp->dirty_rx % RX_RING_SIZE].skb == NULL)
      refill_rx_ring(dev);

  if (!received) {
    printk("received==0\n");
    received = 1;
  }

  dev->quota -= received;
  *budget -= received;
  return 1;  /* not_done */

oom:

        /* Start timer, stop polling, but do not enable rx interrupts. */

	start_poll_timer(dev);
  
  return 0;  /* we'll take it from here so tell core "done"*/

/************************ End note note *********************************/		

}
~~~


위의 내용으로 인해 우리는,
1. rx_work_limit = dev->quota refill_rx_ring() 은 정상적으로 동작하지 않게 될때 rxnobuff  비트를 지워줄 필요가 있다.
2. done /  not_dont 상태가 있다.
3. netif_rx() 대신 netif_receive_skb() 가 skb 를 패스하기 위해 호출된다.
4. 새로운 OOM ( Out of memory ) 조건을 가진다.
5. 새로운 for 루프가 추가되었다.  이는 새로운 패킷의 유입의 확인, 모든 세팅의 정상 동작 및 패킷을 보내는 동안  qouta 를 초과하지 않기 위한 동작등이 포함된다.

Poll 타이머 코드는 아래와 같다. 

~~~c++
if (tp->cur_rx - tp->dirty_rx > RX_RING_SIZE/2 || tp->rx_buffers[tp->dirty_rx % RX_RING_SIZE].skb == NULL) 
  refill_rx_ring(dev);


/* If RX ring is not full we are still out of memory.
	 Restart the timer again. Else we re-add ourselves 
   to the master poll list.
*/


if (tp->rx_buffers[tp->dirty_rx % RX_RING_SIZE].skb == NULL)
    restart_timer();
else netif_rx_schedule(dev);  /* we are back on the poll list */
~~~

5. dev->close() , dev->suspend() 이슈 

    드라이버 개발자는 본 내용에 대해 신경쓰지 않아도 된다.  본 내용은 향후 채워진다. 


6. /proc 에 새로운 스탯의 추가. 

    새로운 기능의 디버깅으로 인해 본 내용 역시 나중에 추가하기로 한다. 




## APPENDIX 1:  HW FC 사용에 대한 논의 

대부분의 FC 칩들은  Rx buffer 에 더이상 공간이 없을때 pause packet 을 전송한다. NAPI 의 softirq 에 의해 DMA ring 에서 패킷을 빼 낼때, 패킷의 유입 량에 비해 시스템이 패킷을 가져오는 속도가 느린 경우 ( 시스템이 패킷을 지우는 속도 보다 유입되는 속도가 더 빠를때 ) 이론적으로 이와 같은 packet storm 으로 발생한 모든 패킷에 대해 단 1회의 rx 인터럽트를 호출 하여 해결 할 수 있다.  

낮은 부하상태에서는, 패킷 당 1회의 인터럽트가 발생이 가능하다. 

FC는 충분히 빠른 속도로 시스템이 패킷을 끄집어 내지 못할때에 대비하여 프로그램 되어야 한다. ( send a pause when out of rx buffers ) 

FC가 좋은 솔루션이긴 하지만, 너무 고가이다. (옛날 문서니까. 역자주) 




APPENDIX 2: rotting packet  /  race-window avoidance 스키마

( 이 부분 번역은 생략.  쓰다보니 appendix 까지 번역해야 하는 생각이 스멀스멀.. ) 

here are two types of associations seen here


## status/int which honors level triggered IRQ


If a status bit for receive or rxnobuff is set and the corresponding interrupt-enable bit is not on, then no interrupts will be generated. However, as soon as the "interrupt-enable" bit is unmasked, an immediate interrupt is generated.  [assuming the status bit was not turned off].

Generally the concept of level triggered IRQs in association with a status and interrupt-enable CSR register set is used to avoid the race.


If we take the example of the tulip:

"pending work" is indicated by the status bit(CSR5 in tulip). the corresponding interrupt bit (CSR7 in tulip) might be turned off (but the CSR5 will continue to be turned on with new packet arrivals even if we clear it the first time)

Very important is the fact that if we turn on the interrupt bit on when tatus is set that an immediate irq is triggered.

 If we cleared the rx ring and proclaimed there was "no more work to be done" and then went on to do a few other things;  then when we enable interrupts, there is a possibility that a new packet might sneak in during this phase. It helps to look at the pseudo code for the tulip poll routine:


~~~c++
do {
    ACK;
      while (ring_is_not_empty()) {
        work-work-work
        if quota is exceeded: exit, no touching irq status/mask
      }

      /* No packets, but new can arrive while we are doing this*/

      CSR5 := read
      
      if (CSR5 is not set) {

      /* If something arrives in this narrow window here,

      *  where the comments are ;-> irq will be generated */

        unmask irqs;
        exit poll;
        }

} while (rx_status_is_set);
~~~


CSR5 bit of interest is only the rx status. 

If you look at the last if statement: 

you just finished grabbing all the packets from the rx ring .. you check if status bit says theres more packets just in ... it says none; you then enable rx interrupts again; if a new packet just came in during this check, we are counting that CSR5 will be set in that small window of opportunity and that by re-enabling interrupts, we would actually triger an interrupt to register the new packet for processing.

[The above description nay be very verbose, if you have better wording that will make this more understandable, please suggest it.]


## non-capable hardware

These do not generally respect level triggered IRQs. Normally, irqs may be lost while being masked and the only way to leave poll is to do a double check for new input after netif_rx_complete() is invoked and re-enable polling (after seeing this new input).

Sample code:

~~~c
restart_poll:
	while (ring_is_not_empty()) {
		work-work-work
		if quota is exceeded: exit, not touching irq status/mask
	}

	enable_rx_interrupts()
	netif_rx_complete(dev);

	if (ring_has_new_packet() && netif_rx_reschedule(dev, received)) {

		disable_rx_and_rxnobufs()
		goto restart_poll
	} while (rx_status_is_set);
~~~

Basically netif_rx_complete() removes us from the poll list, but because a new packet which will never be caught due to the possibility of a race might come in, we attempt to re-add ourselves to the poll list. 

---------------------------------------------------------------


relevant sites:
==================

ftp://robur.slu.se/pub/Linux/net-development/NAPI/

-------------------------------------------------------------
TODO: Write net-skeleton.c driver.
-------------------------------------------------------------


Authors:
========

Alexey Kuznetsov <kuznet@ms2.inr.ac.ru>  
Jamal Hadi Salim <hadi@cyberus.ca>  
Robert Olsson <Robert.Olsson@data.slu.se>  


Acknowledgements:
================

People who made this document better:

Lennert Buytenhek <buytenh@gnu.org>  
Andrew Morton  <akpm@zip.com.au>  
Manfred Spraul <manfred@colorfullife.com>  
Donald Becker <becker@scyld.com>  
Jeff Garzik <jgarzik@mandrakesoft.com>  



결국, 이런저런 내용이 많지만, NAPI 의 핵심은 다음의 몇가지로 압축 될 수 있다.

1. 고부하 상태건 저부하 상태건 패킷의 유입으로 인한 하드웨어로 부터 ( 하드웨어 드라이버로 부터)의 직접적인 인터럽트는 시스템에 심각한 부하를 일으킬 가능성이 있다.

2. 따라서 이와 같은 인터럽트는 NAPI 및 기타 하드웨어 ( NIC )의 인터럽트 제어를 통해 부하율을 낮출 수 있으나, 다소간의 지연이 발생 할 수 있다.

3. NAPI 가 동작하는 기본적인 방식은 Polling 이며, 이를 쉽게 말하면 유입된 패킷이 발생할때 마다 인터럽트 하여
가져오는 것이 아니라 드라이버가 원하는 때에 적절한 스케줄링을 통하여 폴링으로 한꺼번에 가져온다.

4. 따라서 이러한 패킷을 저장하기 위한 공간이 필요하며, 이러한 공간이 포화가 된 경우/ 또는 시스템에서 처리
불가능한 경우 등에 대한 대비가 필요하다.

5. NAPI 는 기본적으로 rx ring 에 동작한다.


로 압축 할 수 있겠다.

번역한 문서가 아주 옛날 버전이기는 하지만, 최신 문서 소개해 봐야 다 기본 내용은 거기서 거기.

실제 netpipe 등과 같은 툴을 통해 packet storming 이나 하드웨어 레벨의 테스팅을 하다 보면 쉽게 접하고 튜닝이 가능한 부분이며, 힘들어하는 시스템에 idle 을 조금이나마 안겨 줄 수 있는 방법이라 하겠다. 배포판 또는 드라이버별로 적용이 되고 안되는 등의 차이가 있는 듯 하니 궁금하면 dmesg 를 확인 해 보길 바란다.


오늘은 이만..
