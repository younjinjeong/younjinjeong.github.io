---
title: "syscall(2) - indirect system call"
date: 2021-04-22T12:52:12+08:00
draft: true
categories:
  - Linux Manual Page
  - syscall(2)
  - Linux Internals 
  - Translate
  - Korean
tags: [Linux, System Call, Translate, Korean, syscall]
---

# 원문 링크
https://man7.org/linux/man-pages/man2/syscall.2.html 

# 번역 

## 이름 
  syscall - 간접 시스템 콜 

## 시놉시스 
~~~c 
#include <unistd.h>
#include <sys/syscall.h>   /* For SYS_xxx definitions */

long syscall(long number, ...);
~~~

glibc 기능 테스트 매크로 요구사항 ([feature_test_macros(7)](https://man7.org/linux/man-pages/man7/feature_test_macros.7.html))

~~~c
syscall():
  Since glibc 2.19:
      _DEFAULT_SOURCE
  Before glibc 2.19:
      _BSD_SOURCE || _SVID_SOURCE
~~~


## 설명 

syscall()은 번호(number)로 지정된 어셈블리 언어 기반 인터페이스로 지정된 인자를 가진 작은 라이브러리 함수이다. syscall()의 예를 들면 C 라이브러에 래퍼 함수 없이 존재하는 시스템콜을 호출하고자 하는경우 유용하다. 

syscall()은 시스템콜을 호출하기전 CPU 레지스터를 저장하고 시스템콜 호출이 리턴될때 레지스터값을 복원한 후, 시스템콜에서 발생한 오류를 [errno(3)]()에 저장한다. 

시스템콜의 상징 번호는 헤더 파일 <sys/syscall.h>에서 참고할 수 있다. 


## 리턴 값 

리턴 값은 시스템콜이 호출되는 시점에 정해진다. 일반적으로 a 0 리턴 값은 성공을 의미한다. A -1 리턴값은 에러를 의미하며, 이 에러에 대한 에러 번호는 [errno(3)]()에 저장된다. 


## 특이사항 

syscall()은 4BSD에서 처음 소개되었다. 


### 아키텍처 요구사항 

각 ABI 아키텍처는 시스템콜 인자를 커널에 전달하는 그만의 요구사항이 있다. glibc 래퍼를 가진 시스템콜들은 glibc가 인자를 올바른 레지스터에 복사하는 작업을 처리한다. 하지만 syscall()을 사용하는 경우에는 아키텍처에 따라 직접 처리해야할 필요가 있을수 있다. 이는 특정 32비트 아키텍처에서 일반적으로 요구된다.

예를들면, ABI가 임베드된 (EABI) ARM 아키텍처에서는 64비트 값(long long)은 반드시 동일한 레지스터 쌍과 정열되어야 한다. 따라서 glibc 에서 제공된 래퍼 함수를 사용하는 대신 syscall()을 사용하여 [readahead(2)]() 시스템콜을 리틀-엔디언 모드의 EABI를 사용하는 ARM 아키텍처에서 다음과 같이 호출된다. 

~~~c
syscall(SYS_readahead, fd, 0,
  (unsigned int) (offset & 0xFFFFFFFF),
  (unsigned int) (offset >> 32),
  count);
~~~

오프셋 인자가 64비트이므로, 첫번째 인자 (fd)는 r0으로 전달되며 호출자는 반드시 64비트의 값을 분리 정열하여 r2/r3 레지스터쌍에 전달해야 한다. 이는 가짜의 값을 r1 (r0에 대응하는 쌍)에 넣어야 함을 의미한다. 또한 분리된 값들에 엔디안 규칙이 적용되었음에 주의하자. (해당 플랫폼의 C ABI에 따라)

PowerPC의 O32 ABI MIPS, Xtensa의 32비트 ABI의 parisc에서도 이와 유사하다. 

parisc C ABI 에서도 정렬된 레지스터 쌍을 사용하는데, 사용자 공간으로부터 이를 숨기기 위해 심 계층(shim layer)를 사용한다는 점에 유의하자. 

이와 같은 구조에 영향을 받는 시스템콜은 [fadvise64(2)](), [ftruncate64(2)](), [posix_fadvise(2)](), [pread64(2)](), [pwrite64(2)](), [readahead(2)](), [sync_file_range(2)](), [truncate64(2)]() 가 있다. 

직접 64비트의 값을 수동으로 분리 정렬해주어야할 필요가 없는 시스템콜은 다음과 같다. [_llseek(2)](), [preadv(2)](), [preadv2(2)](), [pwritev(2)](), [pwritev2(2)](). 오랜세월 누적된 짐들의 세계에 온것을 환영한다. 


### 아키텍처별 호출 규칙 

모든 아키텍처는 그만의 커널 인자 전달 및 호출 방법이 있다. 이에대한 세부사항은 아래 두개의 표에 기술되어 있다. 

첫번째 표는 커널 모드(아마 커널 모드로 인자 전달을 위한 가장 빠른 방법은 아닌 - 아마도 [vdso(7)]()참고)로 전달하기 위한 방법을 나타내는데, 시스템 콜에 부여된 숫자를 나타내기위한 레지스터, 시스템콜 호출의 결과를 리턴하기위한 레지스터, 그리고 에러 시그널을 위해 사용되는 레지스터를 표시한다. 


Arch/ABI    Instruction           System  Ret  Ret  Error    Notes  
                                        call #  val  val2  
───────────────────────────────────────────────────────────────────  
alpha       callsys               v0      v0   a4   a3       1, 6  
arc         trap0                 r8      r0   -    -
arm/OABI    swi NR                -       r0   -    -        2
arm/EABI    swi 0x0               r7      r0   r1   -
arm64       svc #0                w8      x0   x1   -
blackfin    excpt 0x0             P0      R0   -    -
i386        int $0x80             eax     eax  edx  -
ia64        break 0x100000        r15     r8   r9   r10      1, 6
m68k        trap #0               d0      d0   -    -
microblaze  brki r14,8            r12     r3   -    -
mips        syscall               v0      v0   v1   a3       1, 6
nios2       trap                  r2      r2   -    r7
parisc      ble 0x100(%sr2, %r0)  r20     r28  -    -
powerpc     sc                    r0      r3   -    r0       1
powerpc64   sc                    r0      r3   -    cr0.SO   1
riscv       ecall                 a7      a0   a1   -
s390        svc 0                 r1      r2   r3   -        3
s390x       svc 0                 r1      r2   r3   -        3
superh      trapa #31             r3      r0   r1   -        4, 6
sparc/32    t 0x10                g1      o0   o1   psr/csr  1, 6
sparc/64    t 0x6d                g1      o0   o1   psr/csr  1, 6
tile        swint1                R10     R00  -    R01      1
x86-64      syscall               rax     rax  rdx  -        5
x32         syscall               rax     rax  rdx  -        5
xtensa      syscall               a2      a2   -    -