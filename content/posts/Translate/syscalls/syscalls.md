---
title: "Syscalls - Linux manual page"
date: 2021-04-15T21:53:19+08:00
draft: false
authors:
  - younjinjeong
categories:
  - Linux Manual Page
  - syscalls(2)
  - Linux Internals 
  - Translate
  - Korean
tags: [Linux, SystemCall, Translate, Korean, syscall]
---

심심하니까 시리즈 번역물을 만들어 보기로 한다. 또하나의 장기 프로젝트 - 시스템콜 


# 원문 링크 
[syscalls(2) - Linux manual page](https://man7.org/linux/man-pages/man2/syscalls.2.html#:~:text=The%20system%20call%20is%20the,or%20perhaps%20some%20other%20library)

# 번역 

## 이름 
  syscalls - Linux system calls 

## 시놉시스 

  Linux system calls 

## 설명 

  시스템콜이라 함은 리눅스 커널과 애플리케이션 사이의 기반 인터페이스를 의미한다. 

### 시스템콜과 라이브러리 래퍼(wrapper) 함수 

  애플리케이션에서 시스템콜을 직접 호출하는 경우는 많지않다. 대신 glibc(또는 다른 라이브러리)에 내장된 래퍼 함수를 통해 호출된다. 시스템콜을 직접 호출하는 방법에 대해 알고 싶다면, [다음](https://man7.org/linux/man-pages/man2/intro.2.html)을 참조하자. 항상은 아니지만 대부분의 경우, 라이브러리에 내장된 래퍼 함수의 이름은 호출하고자 하는 시스템콜의 이름과 동일하다. 예를들면 glibc는 chdir()이라는 함수를 제공하는데 이는 "chdir" 이라는 시스템콜과 이름이 같다.  

  일반적으로 glibc 내장 래퍼 함수는 매우 간략한 구조를 가진다. 시스템콜을 호출하기 전에 필요한 필요한 인자(arguments)를 올바른 레지스터에 복사하고, 시스템콜의 리턴을 바탕으로 [errno](https://man7.org/linux/man-pages/man3/errno.3.html)를 정확하게 설정하는 정도의 역할을 수행한다. (래퍼 함수가 없이 직접 시스템콜을 호출할때 [syscall(2)](https://man7.org/linux/man-pages/man2/syscall.2.html)은 이와 동일한 방법과 절차로 시스템콜을 호출한다. __노트__ [syscall(2)](https://man7.org/linux/man-pages/man2/syscall.2.html)에 명시된 별도의 분리된 에러 레지스터/플래그가 없는 아키텍처에서는 실패한 시스템콜 호출의 결과로 음수(negative)의 에러 상수를 리턴한다. 아무튼 이런 시스템콜 호출 실패가 발생하면 래퍼 함수는 시스템콜로 부터 리턴된 에러 상수에 다시 (-)를 곱하고(양수로 만들기 위해), 이를 [errno](https://man7.org/linux/man-pages/man3/errno.3.html)로 복사한 후 래퍼를 호출한 함수에 -1을 리턴한다.  

  래퍼 함수는 시스템콜을 호출하기전에 위에 설명한 기본 동작에 더하여 추가적인 작업을 수행하기도 한다. 예를 들면, (아래에 설명한 이유로 인해) 최근에는 [truncate(2)](https://man7.org/linux/man-pages/man2/truncate.2.html)와 [truncate64(2)](https://man7.org/linux/man-pages/man2/truncate64.2.html) 처럼 하나의 시스템에 두개의 시스템콜이 동시에 존재하는 경우, glibc의 **truncate()** 래퍼 함수가 호출 되었을때 이 두개의 시스템콜중 어떤것이 시스템에서 유효한지 확인한후 올바른 시스템콜을 선택하는 작업이다.   


### 시스템콜의 리스트 

  아래는 리눅스 시스템콜 리스트에 대해 기술했다. 리스트에서 **Kernel** 컬럼은 새롭게 소개된 시스템콜이 어떠한 커널 버전 부터 제공되었는지를 표시한다. 다음의 사항들을 참고: 

  - 커널 버전이 명시되지 않은 경우엔 해당 시스템콜은 커널 버전 1.0 또는 그 이전부터 제공된 것이다. 
  - "1.2"로 표시된 시스템콜의 경우 커널 버전 1.1.x 부터 준비되어 실제로 사용된 첫 커널 안정화(stable) 버전은 1.2라는 의미다. [리눅스 커널 버전 의미](https://blankspace-dev.tistory.com/283#:~:text=%EB%A6%AC%EB%88%85%EC%8A%A4%20%EC%BB%A4%EB%84%90%20%EB%B2%84%EC%A0%84%EC%9D%80%20%EC%A0%90,%EB%B6%80%20%EB%B2%84%EC%A0%84%EC%9D%84%20%EB%9C%BB%ED%95%9C%EB%8B%A4.&text=%EC%98%88%EB%A5%BC%20%EB%93%A4%EB%A9%B4%2C%202.6.30.1,%EC%95%88%EC%A0%95%20%EC%BB%A4%EB%84%90%EC%9D%B4%EB%9D%BC%EA%B3%A0%20%EB%B3%B4%EB%A9%B4%20%EB%90%9C%EB%8B%A4.)
  - "2.0"으로 표시된 시스템콜의 경우 1.3.x 커널에서 처음 소개되었으며, 안정화 버전으로는 2.0 에서 처음 사용된 시스템콜이다. (2.0 버전의 커널 개발은 1.2.x - 아마도 1.2.10 - 버전의 커널 브랜치애서 시작되었으며 1.3.x는 불안정한 시리즈다.) 
  - "2.2"로 표시된 시스템콜은 2.1.x 버전부터 개발되었으며, 안정화 버전으로는 2.2.0 에서 처음 소개된 것들이다. (2.2 커널은 2.0.21 브랜치에서 시작되었으며 2.1.x 시리즈는 불안정 버전이다.)
  - "2.4"로 표시된 시스템콜은 2.3.x 버전부터 개발되었으며, 안정화 버전으로는 2.4.0 에서 처음 소개된 것들이다. (2.4 커널은 2.2.8 에서 시작되었으며, 이는 2.3.x 시리즈는 불안정 버전이다.)
  - "2.6"으로 표시된 시스템콜은 2.5.x 버전부터 개발되었으며, 안정화 버전으로는 2.6.0 에서 처음 소개된 것들이다. (2.6 커널은 2.4.15 에서 시작되었으며, 2.5.x 시리즈는 불안정 버전이다.)
  - 커널 2.6.0 부터는 개발 모델이 변경되었으며, 각 2.6.x 릴리즈는 새로운 시스템콜이 추가되는 경우가 있었다. 이 경우에는 해당 시스템콜에 정확한 버전이 명시되어 있다. 이러한 관습은 2.6.39 버전을 기반으로 개발된 3.x 커널, 3.19 에서 시작된 4.x 커널, 4.20 버전에서 개발된 5.x 커널 시리즈에까지 적용된다. 
  - 몇몇의 경우, 이전 안정화 버전의 커널에서 생성된 브랜치를 통해 개발된 새로운 안정화 버전의 커널에 추가된 시스템콜은 다시 이전 버전의 안정화된 커널 버전에 백포팅되기도 했다. 예를 들면 2.6.x 에 추가된 일부 시스템콜이 2.4.15 이후 버전의 2.4.x 시리즈에 추가된 것과 같다. 적용되는 시스템콜에는 적용된 커널의 메이저 버전을 모두 표기하였다. 

  커널 5.11에 제공되는 (오래된 커널 버전에는 더 적은) 시스템콜 리스트는 아래와 같다. 


  | System call                  | Kernel    | Notes                 |
  | ---------------------------- | --------- | --------------------- |
  | \_llseek(2)                  | 1.2       |                       |
  | \_newselect(2)               | 2.0       |                       |
  | \_sysctl(2)                  | 2.0       | Removed in 5.5        |
  | accept(2)                    | 2.0       | See notes on socketcall(2)          |
  | accept4(2)                   | 2.6.28    |                       |
  | access(2)                    | 1.0       |                       |
  | acct(2)                      | 1.0       |                       |
  | add\_key(2)                  | 2.6.10    |                       |
  | adjtimex(2)                  | 1.0       |                       |
  | alarm(2)                     | 1.0       |                       |
  | alloc\_hugepages(2)          | 2.5.36    | Removed in 2.5.44     |
  | arc\_gettls(2)               | 3.9       | ARC only              |
  | arc\_settls(2)               | 3.9       | ARC only              |
  | arc\_usr\_cmpxchg(2)         | 4.9       | ARC only              |
  | arch\_prctl(2)               | 2.6       | x86\_64, x86 since 4.12   |
  | atomic\_barrier(2)           | 2.6.34    | m68k only             |
  | atomic\_cmpxchg\_32(2)       | 2.6.34    | m68k only             |
  | bdflush(2)                   | 1.2       | Deprecated (does nothing) since 2.6      |
  | bind(2)                      | 2.0       | See notes on socketcall(2)          |
  | bpf(2)                       | 3.18      |                       |
  | brk(2)                       | 1.0       |                       |
  | breakpoint(2)                | 2.2       | ARM OABI only, defined with _ARM\_NR prefix  |
  | cacheflush(2)                | 1.2       | Not on x86            |
  | capget(2)                    | 2.2       |                       |
  | capset(2)                    | 2.2       |                       |
  | chdir(2)                     | 1.0       |                       |
  | chmod(2)                     | 1.0       |                       |
  | chown(2)                     | 2.2       | See chown(2) for version details     |
  | chown32(2)                   | 2.4       |                       |
  | chroot(2)                    | 1.0       |                       |
  | clock\_adjtime(2)            | 2.6.39    |                       |
  | clock\_getres(2)             | 2.6       |                       |
  | clock\_gettime(2)            | 2.6       |                       |
  | clock\_nanosleep(2)          | 2.6       |                       |
  | clock\_settime(2)            | 2.6       |                       |
  | clone2(2)                    | 2.4       | IA-64 only            |
  | clone(2)                     | 1.0       |                       |
  | clone3(2)                    | 5.3       |                       |
  | close(2)                     | 1.0       |                       |
  | close\_range(2)              | 5.9       |                       |
  | connect(2)                   | 2.0       | See notes on socketcall(2)    |
  | copy\_file\_range(2)         | 4.5       |                       |
  | creat(2)                     | 1.0       |                       |
  | create\_module(2)            | 1.0       | Removed in 2.6        |
  | delete\_module(2)            | 1.0       |                       |
  | dup(2)                       | 1.0       |                       |
  | dup2(2)                      | 1.0       |                       |
  | dup3(2)                      | 2.6.27    |                       |
  | epoll\_create(2)             | 2.6       |                       |
  | epoll\_create1(2)            | 2.6.27    |                       |
  | epoll\_ctl(2)                | 2.6       |                       |
  | epoll\_pwait(2)              | 2.6.19    |                       |
  | epoll\_pwait2(2)             | 5.11      |                       |
  | epoll\_wait(2)               | 2.6       |                       |
  | eventfd(2)                   | 2.6.22    |                       |
  | eventfd2(2)                  | 2.6.27    |                       |
  | execv(2)                     | 2.0       | SPARC/SPARC64 only, for compatibility with SunOS        |
  | execve(2)                    | 1.0       |                       |
  | execveat(2)                  | 3.19      |                       |
  | exit(2)                      | 1.0       |                       |
  | exit\_group(2)               | 2.6       |                       |
  | faccessat(2)                 | 2.6.16    |                       |
  | faccessat2(2)                | 5.8       |                       |
  | fadvise64(2)                 | 2.6       |                       |
  | fadvise64\_64(2)             | 2.6       |                       |
  | fallocate(2)                 | 2.6.23    |                       |
  | fanotify\_init(2)            | 2.6.37    |                       |
  | fanotify\_mark(2)            | 2.6.37    |                       |
  | fchdir(2)                    | 1.0       |                       |
  | fchmod(2)                    | 1.0       |                       |
  | fchmodat(2)                  | 2.6.16    |                       |
  | fchown(2)                    | 1.0       |                       |
  | fchown32(2)                  | 2.4       |                       |
  | fchownat(2)                  | 2.6.16    |                       |
  | fcntl(2)                     | 1.0       |                       |
  | fcntl64(2)                   | 2.4       |                       |
  | fdatasync(2)                 | 2.0       |                       |
  | fgetxattr(2)                 | 2.6; 2.4.18 |                     |
  | finit\_module(2)             | 3.8       |                       |
  | flistxattr(2)                | 2.6; 2.4.18 |                     |
  | flock(2)                     | 2.0       |                       |
  | fork(2)                      | 1.0       |                       |
  | free\_hugepages(2)           | 2.5.36    | Removed in 2.5.44     |
  | fremovexattr(2)              | 2.6; 2.4.18 |                     |
  | fsconfig(2)                  | 5.2       |                       |
  | fsetxattr(2)                 | 2.6; 2.4.18 |                     |
  | fsmount(2)                   | 5.2       |                       |
  | fsopen(2)                    | 5.2       |                       |
  | fspick(2)                    | 5.2       |                       |
  | fstat(2)                     | 1.0       |                       |
  | fstat64(2)                   | 2.4       |                       |
  | fstatat64(2)                 | 2.6.16    |                       |
  | fstatfs(2)                   | 1.0       |                       |
  | fstatfs64(2)                 | 2.6       |                       |
  | fsync(2)                     | 1.0       |                       |
  | ftruncate(2)                 | 1.0       |                       |
  | ftruncate64(2)               | 2.4       |                       |
  | futex(2)                     | 2.6       |                       |
  | futimesat(2)                 | 2.6.16    |                       |
  | get\_kernel\_syms(2)         | 1.0       | Removed in 2.6        |
  | get\_mempolicy(2)            | 2.6.6     |                       |
  | get\_robust\_list(2)         | 2.6.17    |                       |
  | get\_thread\_area(2)         | 2.6       |                       |
  | get\_tls(2)                  | 4.15      | ARM OABI only, has \_\_ARM\_NR prefix    |
  | getcpu(2)                    | 2.6.19    |                       |
  | getcwd(2)                    | 2.2       |                       |
  | getdents(2)                  | 2.0       |                       |
  | getdents64(2)                | 2.4       |                       |
  | getdomainname(2)             | 2.2       | SPARC, SPARC64; available as osf\_getdomainname(2) on Alpha since Linux 2.0      |
  | getdtablesize(2)             | 2.0       | SPARC (removed in 2.6.26), available on Alpha as osf\_getdtablesize(2)     |
  | getegid(2)                   | 1.0       |                       |
  | getegid32(2)                 | 2.4       |                       |
  | geteuid(2)                   | 1.0       |                       |
  | geteuid32(2)                 | 2.4       |                       |
  | getgid(2)                    | 1.0       |                       |
  | getgid32(2)                  | 2.4       |                       |
  | getgroups(2)                 | 1.0       |                       |
  | getgroups32(2)               | 2.4       |                       |
  | gethostname(2)               | 2.0       | Alpha, was available on SPARC up to Linux 2.6.26 |
  | getitimer(2)                 | 1.0       |                       |
  | getpeername(2)               | 2.0       | See notes on socketcall(2)         |
  | getpagesize(2)               | 2.0       | Not on x86            |
  | getpgid(2)                   | 1.0       |                       |
  | getpgrp(2)                   | 1.0       |                       |
  | getpid(2)                    | 1.0       |                       |
  | getppid(2)                   | 1.0       |                       |
  | getpriority(2)               | 1.0       |                       |
  | getrandom(2)                 | 3.17      |                       |
  | getresgid(2)                 | 2.2       |                       |
  | getresgid32(2)               | 2.4       |                       |
  | getresuid(2)                 | 2.2       |                       |
  | getresuid32(2)               | 2.4       |                       |
  | getrlimit(2)                 | 1.0       |                       |
  | getrusage(2)                 | 1.0       |                       |
  | getsid(2)                    | 2.0       |                       |
  | getsockname(2)               | 2.0       | See notes on socketcall(2)          |
  | getsockopt(2)                | 2.0       | See notes on socketcall(2)         |
  | gettid(2)                    | 2.4.11    |                       |
  | gettimeofday(2)              | 1.0       |                       |
  | getuid(2)                    | 1.0       |                       |
  | getuid32(2)                  | 2.4       |                       |
  | getunwind(2)                 | 2.4.8     | IA-64 only; deprecated           |
  | getxattr(2)                  | 2.6; 2.4.18 |                    |
  | getxgid(2)                   | 2.0       | Alpha only; see NOTES      |
  | getxpid(2)                   | 2.0       | Alpha only; see NOTES      |
  | getxuid(2)                   | 2.0       | Alpha only; see NOTES      |
  | init\_module(2)              | 1.0       |                       |
  | inotify\_add\_watch(2)       | 2.6.13    |                       |
  | inotify\_init(2)             | 2.6.13    |                       |
  | inotify\_init1(2)            | 2.6.27    |                       |
  | inotify\_rm\_watch(2)        | 2.6.13    |                       |
  | io\_cancel(2)                | 2.6       |                       |
  | io\_destroy(2)               | 2.6       |                       |
  | io\_getevents(2)             | 2.6       |                       |
  | io\_pgetevents(2)            | 4.18      |                       |
  | io\_setup(2)                 | 2.6       |                       |
  | io\_submit(2)                | 2.6       |                       |
  | io\_uring\_enter(2)          | 5.1       |                       |
  | io\_uring\_register(2)       | 5.1       |                       |
  | io\_uring\_setup(2)          | 5.1       |                       |
  | ioctl(2)                     | 1.0       |                       |
  | ioperm(2)                    | 1.0       |                       |
  | iopl(2)                      | 1.0       |                       |
  | ioprio\_get(2)               | 2.6.13    |                       |
  | ioprio\_set(2)               | 2.6.13    |                       |
  | ipc(2)                       | 1.0       |                       |
  | kcmp(2)                      | 3.5       |                       |
  | kern\_features(2)            | 3.7       | SPARC64 only          |
  | kexec\_file\_load(2)         | 3.17      |                       |
  | kexec\_load(2)               | 2.6.13    |                       |
  | keyctl(2)                    | 2.6.10    |                       |
  | kill(2)                      | 1.0       |                       |
  | lchown(2)                    | 1.0       | See chown(2) for version details     |
  | lchown32(2)                  | 2.4       |                       |
  | lgetxattr(2)                 | 2.6; 2.4.18 |                     |
  | link(2)                      | 1.0       |                       |
  | linkat(2)                    | 2.6.16    |                       |
  | listen(2)                    | 2.0       | See notes on socketcall(2)         |
  | listxattr(2)                 | 2.6; 2.4.18 |                    |
  | llistxattr(2)                | 2.6; 2.4.18 |                    |
  | lookup\_dcookie(2)           | 2.6       |                       |
  | lremovexattr(2)              | 2.6; 2.4.18 |                    |
  | lseek(2)                     | 1.0       |                       |
  | lsetxattr(2)                 | 2.6; 2.4.18 |                    |
  | lstat(2)                     | 1.0       |                       |
  | lstat64(2)                   | 2.4       |                       |
  | madvise(2)                   | 2.4       |                       |
  | mbind(2)                     | 2.6.6     |                       |
  | memory\_ordering(2)          | 2.2       | SPARC64 only          |
  | membarrier(2)                | 3.17      |                       |
  | memfd\_create(2)             | 3.17      |                       |
  | migrate\_pages(2)            | 2.6.16    |                       |
  | mincore(2)                   | 2.4       |                       |
  | mkdir(2)                     | 1.0       |                       |
  | mkdirat(2)                   | 2.6.16    |                       |
  | mknod(2)                     | 1.0       |                       |
  | mknodat(2)                   | 2.6.16    |                       |
  | mlock(2)                     | 2.0       |                       |
  | mlock2(2)                    | 4.4       |                       |
  | mlockall(2)                  | 2.0       |                       |
  | mmap(2)                      | 1.0       |                       |
  | mmap2(2)                     | 2.4       |                       |
  | modify\_ldt(2)               | 1.0       |                       |
  | mount(2)                     | 1.0       |                       |
  | move\_mount(2)               | 5.2       |                       |
  | move\_pages(2)               | 2.6.18    |                       |
  | mprotect(2)                  | 1.0       |                       |
  | mq\_getsetattr(2)            | 2.6.6     |                       |
  | mq\_notify(2)                | 2.6.6     |                       |
  | mq\_open(2)                  | 2.6.6     |                       |
  | mq\_timedreceive(2)          | 2.6.6     |                       |
  | mq\_timedsend(2)             | 2.6.6     |                       |
  | mq\_unlink(2)                | 2.6.6     |                       |
  | mremap(2)                    | 2.0       |                       |
  | msgctl(2)                    | 2.0       | See notes on ipc(2)   |
  | msgget(2)                    | 2.0       | See notes on ipc(2)   |
  | msgrcv(2)                    | 2.0       | See notes on ipc(2)   |
  | msgsnd(2)                    | 2.0       | See notes on ipc(2)   |
  | msync(2)                     | 2.0       |                       |
  | munlock(2)                   | 2.0       |                       |
  | munlockall(2)                | 2.0       |                       |
  | munmap(2)                    | 1.0       |                       |
  | name\_to\_handle\_at(2)      | 2.6.39    |                       |
  | nanosleep(2)                 | 2.0       |                       |
  | newfstatat(2)                | 2.6.16    | See stat(2)           |
  | nfsservctl(2)                | 2.2       | Removed in 3.1        |
  | nice(2)                      | 1.0       |                       |
  | old\_adjtimex(2)             | 2.0       | Alpha only; see NOTES      |
  | old\_getrlimit(2)            | 2.4       | Old variant of getrlimit(2) that used a different value for RLIM\_INFINITY       |
  | oldfstat(2)                  | 1.0       |                       |
  | oldlstat(2)                  | 1.0       |                       |
  | oldolduname(2)               | 1.0       |                       |
  | oldstat(2)                   | 1.0       |                       |
  | oldumount(2)                 | 2.4.116   | Name of the old unmount(2) syscall on Alpha      |
  | olduname(2)                  | 1.0       |                       |
  | open(2)                      | 1.0       |                       |
  | open\_by\_handle\_at(2)      | 2.6.39    |                       |
  | open\_tree(2)                | 5.2       |                       |
  | openat(2)                    | 2.6.16    |                       |
  | openat2(2)                   | 5.6       |                       |
  | or1k\_atomic(2)              | 3.1       | OpenRISC 1000 only    |
  | pause(2)                     | 1.0       |                       |
  | pciconfig\_iobase(2)         | 2.2.15; 2.4 |   Not on x86       |
  | pciconfig\_read(2)           | 2.0.26; 2.2 |   Not on x86       |
  | pciconfig\_write(2)          | 2.0.26; 2.2 |   Not on x86       |
  |                              |           |                       |
  | perf\_event\_open(2)         | 2.6.31    | Was perf\_counter\_open() in 2.6.31; renamed in 2.6.32                 |
  | personality(2)               | 1.2       |                       |
  | perfctr(2)                   | 2.2       | SPARC only; removed ㅑㅜ 2.6.34  |
  | perfmonctl(2)                | 2.4       | IA-64 only            |
  | pidfd\_getfd(2)              | 5.6       |                       |
  | pidfd\_send\_signal(2)       | 5.1       |                       |
  | pidfd\_open(2)               | 5.3       |                       |
  | pipe(2)                      | 1.0       |                       |
  | pipe2(2)                     | 2.6.27    |                       |
  | pivot\_root(2)               | 2.4       |                       |
  | pkey\_alloc(2)               | 4.8       |                       |
  | pkey\_free(2)                | 4.8       |                       |
  | pkey\_mprotect(2)            | 4.8       |                       |
  | poll(2)                      | 2.0.36; 2.2  |                    |
  | ppoll(2)                     | 2.6.16    |                       |
  | prctl(2)                     | 2.2       |                       |
  | pread64(2)                   |           | Added as "pread" in 2.2; renamed "pread64" in 2.6   |
  | preadv(2)                    | 2.6.30    |                       |
  | preadv2(2)                   | 4.6       |                       |
  | prlimit64(2)                 | 2.6.36    |                       |
  | process\_madvise(2)          | 5.10      |                       |
  | process\_vm\_readv(2)        | 3.2       |                       |
  | process\_vm\_writev(2)       | 3.2       |                       |
  | pselect6(2)                  | 2.6.16    |                       |
  | ptrace(2)                    | 1.0       |                       |
  | pwrite64(2)                  |           | Added as "pwrite" in 2.2; renamed "pwrite64" in 2.6 |
  | pwritev(2)                   | 2.6.30    |                       |
  | pwritev2(2)                  | 4.6       |                       |
  | query\_module(2)             | 2.2       | Removed in 2.6        |
  | quotactl(2)                  | 1.0       |                       |
  | read(2)                      | 1.0       |                       |
  | readahead(2)                 | 2.4.13    |                       |
  | readdir(2)                   | 1.0       |                       |
  | readlink(2)                  | 1.0       |                       |
  | readlinkat(2)                | 2.6.16    |                       |
  | readv(2)                     | 2.0       |                       |
  | reboot(2)                    | 1.0       |                       |
  | recv(2)                      | 2.0       | See notes on socketcall(2)         |
  | recvfrom(2)                  | 2.0       | See notes on socketcall(2)         |
  | recvmsg(2)                   | 2.0       | See notes on socketcall(2)         |
  | recvmmsg(2)                  | 2.6.33    |                       |
  | remap\_file\_pages(2)        | 2.6       | Deprecated since 3.16     |
  | removexattr(2)               | 2.6; 2.4.18 |                    |
  | rename(2)                    | 1.0       |                       |
  | renameat(2)                  | 2.6.16    |                       |
  | renameat2(2)                 | 3.15      |                       |
  | request\_key(2)              | 2.6.10    |                       |
  | restart\_syscall(2)          | 2.6       |                       |
  | riscv\_flush\_icache(2)      | 4.15      | RISC-V only           |
  | rmdir(2)                     | 1.0       |                       |
  | rseq(2)                      | 4.18      |                       |
  | rt\_sigaction(2)             | 2.2       |                       |
  | rt\_sigpending(2)            | 2.2       |                       |
  |                              |           |                       |
  | rt\_sigprocmask(2)           | 2.2       |                       |
  | rt\_sigqueueinfo(2)          | 2.2       |                       |
  | rt\_sigreturn(2)             | 2.2       |                       |
  | rt\_sigsuspend(2)            | 2.2       |                       |
  | rt\_sigtimedwait(2)          | 2.2       |                       |
  | rt\_tgsigqueueinfo(2)        | 2.6.31    |                       |
  | rtas(2)                      | 2.6.2     | PowerPC/PowerPC64 only     |
  | s390\_runtime\_instr(2)      | 3.7       | s390 only             |
  | s390\_pci\_mmio\_read(2)     | 3.19      | s390 only             |
  | s390\_pci\_mmio\_write(2)    | 3.19      | s390 only             |
  | s390\_sthyi(2)               | 4.15      | s390 only             |
  | s390\_guarded\_storage(2)    | 4.12      | s390 only             |
  | sched\_get\_affinity(2)      | 2.6       | Name of sched\_getaffinity(2) on SPARC and SPARC64             |
  | sched\_get\_priority\_max(2) | 2.0       |                       |
  | sched\_get\_priority\_min(2) | 2.0       |                       |
  | sched\_getaffinity(2)        | 2.6       |                       |
  | sched\_getattr(2)            | 3.14      |                       |
  | sched\_getparam(2)           | 2.0       |                       |
  | sched\_getscheduler(2)       | 2.0       |                       |
  | sched\_rr\_get\_interval(2)  | 2.0       |                       |
  | sched\_set\_affinity(2)      | 2.6       | Name of sched\_setaffinity(2) on SPARC and SPARC64              |
  | sched\_setaffinity(2)        | 2.6       |                       |
  | sched\_setattr(2)            | 3.14      |                       |
  | sched\_setparam(2)           | 2.0       |                       |
  | sched\_setscheduler(2)       | 2.0       |                       |
  | sched\_yield(2)              | 2.0       |                       |
  | seccomp(2)                   | 3.17      |                       |
  | select(2)                    | 1.0       |                       |
  | semctl(2)                    | 2.0       | See notes on ipc(2)   |
  | semget(2)                    | 2.0       | See notes on ipc(2)   |
  | semop(2)                     | 2.0       | See notes on ipc(2)   |
  | semtimedop(2)                | 2.6; 2.4.22  |                    |
  | send(2)                      | 2.0       | See notes on socketcall(2)          |
  | sendfile(2)                  | 2.2       |                       |
  | sendfile64(2)                | 2.6; 2.4.19 |                     |
  | sendmmsg(2)                  | 3.0       |                       |
  | sendmsg(2)                   | 2.0       | See notes on socketcall(2)         |
  | sendto(2)                    | 2.0       | See notes on socketcall(2)         |
  | set\_mempolicy(2)            | 2.6.6     |                       |
  | set\_robust\_list(2)         | 2.6.17    |                       |
  | set\_thread\_area(2)         | 2.6       |                       |
  | set\_tid\_address(2)         | 2.6       |                       |
  | set\_tls(2)                  | 2.6.11    | ARM OABI/EABI only (constant has \_\_ARM\_NR prefix)    |
  | setdomainname(2)             | 1.0       |                       |
  | setfsgid(2)                  | 1.2       |                       |
  | setfsgid32(2)                | 2.4       |                       |
  | setfsuid(2)                  | 1.2       |                       |
  | setfsuid32(2)                | 2.4       |                       |
  | setgid(2)                    | 1.0       |                       |
  | setgid32(2)                  | 2.4       |                       |
  | setgroups(2)                 | 1.0       |                       |
  | setgroups32(2)               | 2.4       |                       |
  | sethae(2)                    | 2.0       | Alpha only; see NOTES       |
  | sethostname(2)               | 1.0       |                       |
  |                              |           |                       |
  | setitimer(2)                 | 1.0       |                       |
  | setns(2)                     | 3.0       |                       |
  | setpgid(2)                   | 1.0       |                       |
  | setpgrp(2)                   | 2.0       | Alternative name for setpgid(2) on Alpha  |
  | setpriority(2)               | 1.0       |                       |
  | setregid(2)                  | 1.0       |                       |
  | setregid32(2)                | 2.4       |                       |
  | setresgid(2)                 | 2.2       |                       |
  | setresgid32(2)               | 2.4       |                       |
  | setresuid(2)                 | 2.2       |                       |
  | setresuid32(2)               | 2.4       |                       |
  | setreuid(2)                  | 1.0       |                       |
  | setreuid32(2)                | 2.4       |                       |
  | setrlimit(2)                 | 1.0       |                       |
  | setsid(2)                    | 1.0       |                       |
  | setsockopt(2)                | 2.0       | See notes on socketcall(2)          |
  | settimeofday(2)              | 1.0       |                       |
  | setuid(2)                    | 1.0       |                       |
  | setuid32(2)                  | 2.4       |                       |
  | setup(2)                     | 1.0       | Removed in 2.2        |
  | setxattr(2)                  | 2.6; 2.4.18 |                    |
  | sgetmask(2)                  | 1.0       |                       |
  | shmat(2)                     | 2.0       | See notes on ipc(2)   |
  | shmctl(2)                    | 2.0       | See notes on ipc(2)   |
  | shmdt(2)                     | 2.0       | See notes on ipc(2)   |
  | shmget(2)                    | 2.0       | See notes on ipc(2)   |
  | shutdown(2)                  | 2.0       | See notes on socketcall(2)          |
  | sigaction(2)                 | 1.0       |                       |
  | sigaltstack(2)               | 2.2       |                       |
  | signal(2)                    | 1.0       |                       |
  | signalfd(2)                  | 2.6.22    |                       |
  | signalfd4(2)                 | 2.6.27    |                       |
  | sigpending(2)                | 1.0       |                       |
  | sigprocmask(2)               | 1.0       |                       |
  | sigreturn(2)                 | 1.0       |                       |
  | sigsuspend(2)                | 1.0       |                       |
  | socket(2)                    | 2.0       | See notes on socketcall(2)          |
  | socketcall(2)                | 1.0       |                       |
  | socketpair(2)                | 2.0       | See notes on socketcall(2)         |
  | spill(2)                     | 2.6.13    | Xtensa only           |
  | splice(2)                    | 2.6.17    |                       |
  | spu\_create(2)               | 2.6.16    | PowerPC/PowerPC64 only    |
  | spu\_run(2)                  | 2.6.16    | PowerPC/PowerPC64 only    |
  | ssetmask(2)                  | 1.0       |                       |
  | stat(2)                      | 1.0       |                       |
  | stat64(2)                    | 2.4       |                       |
  | statfs(2)                    | 1.0       |                       |
  | statfs64(2)                  | 2.6       |                       |
  | statx(2)                     | 4.11      |                       |
  | stime(2)                     | 1.0       |                       |
  | subpage\_prot(2)             | 2.6.25    | PowerPC/PowerPC64 only    |
  | swapcontext(2)               | 2.6.3     | PowerPC/PowerPC64 only    |
  | switch\_endian(2)            | 4.1       | PowerPC64 only        |
  | swapoff(2)                   | 1.0       |                       |
  | swapon(2)                    | 1.0       |                       |
  | symlink(2)                   | 1.0       |                       |
  | symlinkat(2)                 | 2.6.16    |                       |
  | sync(2)                      | 1.0       |                       |
  | sync\_file\_range(2)         | 2.6.17    |                       |
  | sync\_file\_range2(2)        | 2.6.22    |                       |
  | syncfs(2)                    | 2.6.39    |                       |
  | sys\_debug\_setcontext(2)    | 2.6.11    | PowerPC only          |
  | syscall(2)                   | 1.0       | Still available on ARM OABI and MIPS O32 ABI   |
  | sysfs(2)                     | 1.2       |                       |
  | sysinfo(2)                   | 1.0       |                       |
  | syslog(2)                    | 1.0       |                       |
  | sysmips(2)                   | 2.6.0     | MIPS only             |
  | tee(2)                       | 2.6.17    |                       |
  | tgkill(2)                    | 2.6       |                       |
  | time(2)                      | 1.0       |                       |
  | timer\_create(2)             | 2.6       |                       |
  | timer\_delete(2)             | 2.6       |                       |
  | timer\_getoverrun(2)         | 2.6       |                       |
  | timer\_gettime(2)            | 2.6       |                       |
  | timer\_settime(2)            | 2.6       |                       |
  | timerfd\_create(2)           | 2.6.25    |                       |
  | timerfd\_gettime(2)          | 2.6.25    |                       |
  | timerfd\_settime(2)          | 2.6.25    |                       |
  | times(2)                     | 1.0       |                       |
  | tkill(2)                     | 2.6; 2.4.22  |                    |
  | truncate(2)                  | 1.0       |                       |
  | truncate64(2)                | 2.4       |                       |
  | ugetrlimit(2)                | 2.4       |                       |
  | umask(2)                     | 1.0       |                       |
  | umount(2)                    | 1.0       |                       |
  | umount2(2)                   | 2.2       |                       |
  | uname(2)                     | 1.0       |                       |
  | unlink(2)                    | 1.0       |                       |
  | unlinkat(2)                  | 2.6.16    |                       |
  | unshare(2)                   | 2.6.16    |                       |
  | uselib(2)                    | 1.0       |                       |
  | ustat(2)                     | 1.0       |                       |
  | userfaultfd(2)               | 4.3       |                       |
  | usr26(2)                     | 2.4.8.1   | ARM OABI only         |
  | usr32(2)                     | 2.4.8.1   | ARM OABI only         |
  | utime(2)                     | 1.0       |                       |
  | utimensat(2)                 | 2.6.22    |                       |
  | utimes(2)                    | 2.2       |                       |
  | utrap\_install(2)            | 2.2       | SPARC64 only          |
  | vfork(2)                     | 2.2       |                       |
  | vhangup(2)                   | 1.0       |                       |
  | vm86old(2)                   | 1.0       | Was "vm86"; renamed in 2.0.28/2.2  |
  | vm86(2)                      | 2.0.28; 2.2  |                    |
  | vmsplice(2)                  | 2.6.17    |                       |
  | wait4(2)                     | 1.0       |                       |
  | waitid(2)                    | 2.6.10    |                       |
  | waitpid(2)                   | 1.0       |                       |
  | write(2)                     | 1.0       |                       |
  | writev(2)                    | 2.0       |                       |
  | xtensa(2)                    | 2.6.13    | Xtensa only           |


  x86-32를 포함한 많은 플랫폼에서 소켓콜은 모두 [socketcall(2)](https://man7.org/linux/man-pages/man2/socketcall.2.html) (glibc 래퍼 함수)를 사용하여 멀티플렉스 되었으며, System V IPC 콜은 [ipc(2)](https://man7.org/linux/man-pages/man2/ipc.2.html)를 통해 멀티플렉스 되었다.  

  위의 테이블에서 몇몇 슬롯이 공백으로 예약 되어 있으나 (__역주__ 마크다운으로 바꾸면서 공백 지웠음, 나중에 각각의 시스템콜을 번역하면서 추가예정), 다음의 시스템콜은 향후 일반 커널에 추가되지 않을 예정이다. [afs_syscall(2)](), [break(2)](), *ftime(2)*, [getpmsg(2)](), [gtty(2)](), [idle(2)](), [lock(2)](), [madvisel(2)](), [mpx(2)](), [phys(2)](), [prof(2)](), *profil(2)*, [putpmsg(2)](), [security(2)](), [stty(2)](), [tuxcall(2)](), *ulimit(2)*, and [vserver(2)]() ([unimplemented(2)]()의 내용도 참조할 것). 하지만 [ftime(3)](), [profil(3)](), 그리고 [ulimit(3)]() 은 라이브러리 루틴으로서 제공된다. [phys(2)]()를 위한 슬롯은 커널 2.1.116 부터 예약 되었지만,  [umount(2)](); [phys(2)]() 이 두개의 시스템콜은 아직 구현된 적이 없다. [getpmsg(2)]() 와 [putpmsg(2)]() 콜은 STREAMS 지원을 위한 커널 패치에 사용되었지만, 일반 커널에 포함될 일은 없을 것이다. 

  *set_zone_reclaim(2)*는 2.6.13에 추가되었지만, 2.6.16에서 제거되었다. 이 시스템콜은 유저스페이스에 제공된 적은 없다. 

### 특정 포트(아키텍처)에서 제거된 시스템콜 

  특정 리눅스 아키텍처에 존재했으나 삭제된 시스템콜 

  AVR32 (리눅스 4.12 이후 삭제)
  - [pread(2)]()
  - [pwrite(2)]()

  Blackfin (리눅스 4.17 이후 삭제)
  - *bfin_spinlock(2)* (리눅스 2.6.22에서 추가)
  - *dma_memcpy(2)* (리눅스 2.6.22에서 추가)
  - [pread(2)]() (리눅스 2.6.22에서 추가)
  - [pwrite(2)]() (리눅스 2.6.22에서 추가)
  - *sram_alloc(2)* (리눅스 2.6.22에서 추가)
  - *sram_free(2)* (리눅스 2.6.22에서 추가)

  Metag (리눅스 4.17이후 삭제)
  - *metag_get_tls(2)* (리눅스 3.9에서 추가)
  - *metag_set_fpu_flags(2)* (리눅스 3.9에서 추가)
  - *metag_set_tls(2)* (리눅스 3.9에서 추가)
  - *metag_setglobalbit(2)* (리눅스 3.9에서 추가)
  
  Tile (리눅스 4.17이후 삭제)
  - *cmpxchg_badaddr(2)* (리눅스 2.6.36에서 추가)


## 특기 사항 

  대략적으로 시스템콜과 상수 __NR_xxx의 선언 코드는 리눅스 커널 소스 **/usr/include/asm/unistd.h**파일의 **sys_xxx()** 루틴에서 찾아볼 수 있다. 이 안에서는 매우 많은 예외를 찾아볼 수 있는데, 이는 다소 비체계적인 방식으로 오래된 시스템콜을 새로운 시스템콜로 대체하는 과정에서 발생된 것입다. 우선 순위를 가진 플랫폼들, 이를테면 sparc, sparc64 그리고 alpha와 같은 운영체제 에뮬레이션에서는 보다 많은 시스템콜이 추가되었다; mips64 역시 32-bit 시스템콜 전체를 포함하고 있다. 

  많은 시간이 흐르면서 일부 시스템콜의 인터페이스 변화 역시 필수적인것이었다. 매우 공통적 이유중 하나는 구조체의 크기를 늘리거나 시스템콜에 전달해야 하는 스칼라 값의 증가가 필요했기 때문이다. 이러한 변화로 인해 일부 아키텍처(오랫동안 지속되었던 i386기반의 32-bit 아키텍처)에서는 오늘날 매우 다양한 그룹의 관련 시스템콜을 찾아볼수 있으며 (예를 들면 [truncate(2)](), [truncate64(2)]()) 비슷한 작업을 처리하지만 인자의 크기와 같은 세부 구현은 다르다. (앞에서 언급한 바와 같이 일반적으로 애플리케이션에서는 이러한 구분을 생각할 필요가 없다: glibc 래퍼 함수가 이러한 작업을 선처리하여 올바른 시스템콜이 호출되도록 지원하며, 오래된 바이너리를 위한 ABI 호환성을 처리해주기 때문이다.) 다양한 버전으로 존재하는 시스템콜에 대한 예제들은 다음과 같다. 

  - 오늘날 [stat(2)]()의 3개의 다른 버전이 존재한다: *sys_stat()* (slot *__NR_oldstat*), *sys_newstat()* (slot *__NR_stat*), 그리고 *sys_stat64()* (slot *__NR_stat64*) 들이며 가장 마지막이 가장 최신이다. [lstate(2)](), [fstat(2)]() 이 두 시스템콜 역시 이와 유사하게 다른 버전이 존재한다. 
  - *__NR_oldolduname*, *__NR_olduname*, *__NR_uname* 정의(define)는 루틴 *sys_olduname()*, *sys_uname*, *sys_newuname()* 에서 참조된다. 
  - 리눅스 2.0에서 신규 버전의 [vm86(2)]() 시스템콜 등장과 함께 이전 및 신규 커널 루틴에서 각각 *sys_vm86old()* 와 *sys_vm86()* 으로 명명되었다. 
  - 리눅스 2.4에서 [getrlimit(2)]()의 신규 버전의 등장과 함께 이전 및 신규 각각의 커널 루틴은 *sys_old_getrlimit()* (slot *__NR_getrlimit*)과 *sys_getrlimit()* (slot *__NR_ugetrlimit*)으로 명명 되었다. 
  - 리눅스 2.4에서는 사용자와 그룹 ID가 16비트에서 32비트로 변경되었다. 이를 반영하기 위해 종전의 "32"라는 접미사가 없었던 관련 시스템콜에 모두 32의 명명이 적용되었다. (예 [chown32(2)](), [getuid32(2)](), [getgroups32(2)](), [setresuid32(2)]())
  - 리눅스 2.5에서는 32비트 아키텍처에서도 큰 파일(large file) 접근 지원이 추가되었다. (예: 32비트로는 표현될 수 없는 크기와 오프셋을 가진 파일) 이를 지원하기 위해 파일 오프셋과 크기를 지원하기 위한 대체 시스템콜이 필요했다. 다음의 시스템콜이 이를 위해 추가 되었다. [fcntl64(2)](), [getdents64(2)](), [stat64(2)](), [statfs64(2)](), [truncate64(2)]() 그리고 이들과 관련된 파일 데스크립터(fd, file descriptor)와 심볼릭 링크. 이 새롭게 추가된 시스템콜은 "64" 접미어가 없이 직접 "stat"을 호출하는 경우를 제외한 모든 경우에 종전의 동일한 이름을 가진 시스템콜을 대체한다. 

  64-bit 파일 접근 또는 32-bit UIDs/GIDs중 단 하나만을 지원하는 최근의 플랫폼에서는 (예: alpha, ia64, s390x, x86-64) 한개의 버전만이 GIDs/UIDs 및 파일 접근 시스템콜을 위해 제공된다. (일반적으로 32비트 플랫폼들에서) *64와 *32 두가지 모두 존재하는 플랫폼에서 둘중의 하나는 사용되지 않는다. __역주__ 32비트와 64비트 모두 존재하는 아키텍처에서 커널은 두가지 버전 모두를 지원하는 시스템콜을 제공하지만, 실제 시스템에 따라 둘중의 하나만 사용된다는 의미. 

  - *rt_sig** 콜은 커널 2.2에서 실시간(real-time) 시그널을 지원하기위해 추가되었다. ([signal(7)]()참고) 이 시스템콜들은 rt_ 접두어를 가지지 않은 이전 시스템콜을 대체한다. 
  - [select(2)]()와 [mmap(2)]() 시스템콜은 5개 또는 그 이상의 인자를 사용하는데, 이는 i386에서만 종전과 사용하던 방법과 차이가 있어 문제가 되었다. 따라서 다른 아키텍처들이 *__NR_select*와 *__NR_mmap*에 대응하는 *sys_select()*와 *sys_mmap()*를 사용하는 동안, i386에서는 *old_select()*, *old_mmap()* (인자 블럭의 전달을 위해 포인터를 사용하는 루틴을 적용한 함수)이 제공됬다. 하지만 오늘날 5개의 인자 전달은 더이상 문제가 되지 않으며, *sys_select()*에 해당하는 *__NR__newselect*가 제공되며 *__NR_mmap2* 역시 이와 유사한 패턴으로 존재한다. 오늘날 *old_mmap()*을 사용하는 64비트 아키텍처는 s390x 가 유일하다. 


### 특수 아키텍처 세부사항 : Alpha

  - *getxgid(2)*는 레지스터 r0와 r20을 통해 GID와 유효 GID 한쌍을 리턴한다. 이는 [getgid(2)]()와 [getegid(2)]()를 대체한다. 
  - *getxpid(2)*는 PID와 부모 PID를 레지지스터 r0와 r20을 통해 리턴한다. 이는 [getpid(2)]()와 [getppid(2)]()를 대체한다. 
  - *old_adjtimex(2)*는 OSF/1 호환을 위해 *struct timeval32*를 사용하는 [adjtimex(2)]()의 변형이다. 
  - *getxuid(2)*는 레지스터 r0과 r20을 사용해 GID와 유효 GID 한쌍을 리턴한다. 이는 [getuid(2)]() [geteuid(2)]()를 대체한다. 
  - *sethae(2)*는 저렴한 Alpha 시스템에서 27비트 이상의 주소 공간에 접근하기 위해 필요한 호스트 주소 확장(Host Address Extension)레지스터를 설정하는데 사용된다. 


## 함께 보기 

intro(2), syscall(2), unimplemented(2), errno(3), libc(7), vdso(7)


## COLOPHON 

이 페이지는 리눅스 매뉴얼 페이지 프로젝트 5.11 릴리즈의 일부이다. 프로젝트의 상세 설명, 버그 리포트 및 본 페이지의 최신 버전에 대한 정보는 다음의 링크에서 확인할 수 있다.  
[https://www.kernel.org/doc/man-pages/](https://www.kernel.org/doc/man-pages/.)
 