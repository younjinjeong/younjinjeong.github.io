---
title: "errno(3) - Linux manual page"
date: 2021-04-16T15:04:51+08:00
draft: true
categories:
  - Linux Manual Page
  - errno(3)
  - Linux Internals 
  - Translate
  - Korean
tags: [Linux, SystemCall, Translate, Korean, errno]
---

# 원문 링크 

[errno(3) - Linux manual page](https://man7.org/linux/man-pages/man3/errno.3.html)

## 이름 

errno - 마지막 에러 번호(number)


## 시놉시스 
~~~c
#include <errno.h>
~~~

## 세부설명 

<errno.h> 헤더 파일에는 시스템콜이나 일부 라이브러리 함수 동작에 문제가 있을때 무엇이 잘못되었는지를 나타내는 정수 타입의 *errno* 변수가 선언되어 있다. 


### errno 

*errno* 변수의 값은 호출이 에러를 리턴한 경우에만 중요하다. (예로, 대부분의 시스템콜은 -1을, 대부분의 라이브러리 함수에서는 NULL이나 -1을 리턴한다); 성공한 함수에게는 *errno*의 값 변경이 허락된다. 모든 시스템콜 및 라이브러리 함수는 *errno* 값을 0으로 설정할 수 없다. 

일부 시스템콜 또는 라이브러리 함수는 (예 [getpriority(2)](https://man7.org/linux/man-pages/man2/getpriority.2.html)) 정상적으로 수행되었을때 -1을 리턴하기도 한다. 이러한 경우, 호출을 수행하기 전에 *errno* 값을 0으로 설정한 후 만약 해당 호출에 에러가 발생한 경우에는 *errno*의 값이 0인지 아닌지를 확인하는 방법으로 호출의 성공여부를 파악할 수 있다. 

*errno*는 변경 가능한 *int* 타입의 lvalue로서 ISO C표준으로 정의되어 있으며, 절대 명시적으로 선언해서는 안된다. *errno*는 또한 매크로(macro)일 수도 있다. *errno*는 스레드-로컬, 즉 하나의 스레드에서 설정된 값은 다른 스레드에 의해 영향을 받지 않는다. 


### 에러 번호와 에러 이름 

유효환 에러 번호는 모두 양수이다. <errno.h> 헤더 파일에서는 *errno*의 값이 될 수 있는 양수로 되어있는 각각의 에러 번호에 상징적 이름을 부여하고 있다.  

모든 에러의 이름은 POSIX.1에 정의되어 있으며, 각각의 에러는 *EAGAIN*과 *EWOULDBLOCK* 를 제외한 반드시 고유한 값을 가져야 한다. 리눅스에서는 이 두개는 모든 아키텍처에서 동일한 값을 가진다. 

에러 번호는 매우 광범위한 UNIX 시스템과 리눅스가 지원하는 다양한 아키텍처에서 넓게 사용되는 상징적 이름과 매칭된다. 따라서 특정 에러 이름에 대흥하는 번호는 아래에 표에 별도로 명시하지 않았다. [perror(3)](https://man7.org/linux/man-pages/man3/perror.3.html)와 [strerror(3)](https://man7.org/linux/man-pages/man3/strerror.3.html) 함수들은 에러 이름들을 사람이 이해 가능한 에러 메세지로 변환하는데 사용된다. 

리눅스 시스템에서는 아래에 나열된 모든 심볼릭 에러 리스트를 전부 제공할 가능성이 있으며 에러 이름과 그에 상응하는 에러 번호를 *errno(1)* 명령어를 사용하여 조회가 가능하다. (*errno* 명령어는 *moreutils* 패키지에 포함되어 있다)

~~~bash
$ errno -l 
EPERM 1 Operation not permitted
ENOENT 2 No such file or directory
ESRCH 3 No such process
EINTR 4 Interrupted system call
EIO 5 Input/output error
~~~

*errno(1)* 명령어는 특정 에러 번호와 이름을 검색하는데 사용할 수도 있으며, 이를 통해 해당 에러에 대한 설명도 함께 조회할 수 있다. 아래의 예제를 살펴보자. 

~~~bash
$ errno 2 
ENOENT 2 No such file or directory 
$ errno ESRCH 
ESRCH 3 No such process 
$ errno -s permission 
EACCES 13 Permission denied 
~~~


### 에러 이름 리스트 

아래 리스트의 에러를 나타내는 심볼릭 이름들은 아래의 표시를 따른다. 

- POSIX.1-2001: POSIX.1-2001에서 정의된 이름 및 그 이후의 POSIX.1 버전에서 정의된 이름. (별도의 명시가 없는한)
- POSIX.1-2008: POSIX.1 표준 이전에 정의된 이름을 제외한 POSIX.1-2008에서 정의된 이름 
- C99: C99에 의해 정의된 이름 

아래는 리눅스에서 정의된 심볼릭 에러 이름의 리스트: 

*E2BIG* Argument list too long (POSIX.1-2001)  

EACCES Permission denied (POSIX.1-2001). 

EADDRINUSE
        Address already in use (POSIX.1-2001).  

EADDRNOTAVAIL
        Address not available (POSIX.1-2001).  

EAFNOSUPPORT
        Address family not supported (POSIX.1-2001).   

EAGAIN Resource temporarily unavailable (may be the same value as EWOULDBLOCK) (POSIX.1-2001).

EALREADY
        Connection already in progress (POSIX.1-2001). 

EBADE  Invalid exchange.  

EBADF  Bad file descriptor (POSIX.1-2001). 

EBADFD File descriptor in bad state. 

EBADMSG
        Bad message (POSIX.1-2001).

EBADR  Invalid request descriptor.

EBADRQC
        Invalid request code.

EBADSLT
        Invalid slot.

EBUSY  Device or resource busy (POSIX.1-2001).

ECANCELED
        Operation canceled (POSIX.1-2001).

ECHILD No child processes (POSIX.1-2001).

ECHRNG Channel number out of range.

ECOMM  Communication error on send.

ECONNABORTED
        Connection aborted (POSIX.1-2001).

ECONNREFUSED
        Connection refused (POSIX.1-2001).

ECONNRESET
        Connection reset (POSIX.1-2001).

EDEADLK
        Resource deadlock avoided (POSIX.1-2001).

EDEADLOCK
        On most architectures, a synonym for EDEADLK.  On some
        architectures (e.g., Linux MIPS, PowerPC, SPARC), it is a
        separate error code "File locking deadlock error".

EDESTADDRREQ
        Destination address required (POSIX.1-2001).

EDOM   Mathematics argument out of domain of function (POSIX.1,
        C99).

EDQUOT Disk quota exceeded (POSIX.1-2001).

EEXIST File exists (POSIX.1-2001).

EFAULT Bad address (POSIX.1-2001).

EFBIG  File too large (POSIX.1-2001).

EHOSTDOWN
        Host is down.

EHOSTUNREACH
        Host is unreachable (POSIX.1-2001).

EHWPOISON
        Memory page has hardware error.

EIDRM  Identifier removed (POSIX.1-2001).

EILSEQ Invalid or incomplete multibyte or wide character (POSIX.1, C99).  
        The text shown here is the glibc error description; in
        POSIX.1, this error is described as "Illegal byte
        sequence".

EINPROGRESS
        Operation in progress (POSIX.1-2001).

EINTR  Interrupted function call (POSIX.1-2001); see signal(7).

EINVAL Invalid argument (POSIX.1-2001).

EIO    Input/output error (POSIX.1-2001).

EISCONN
        Socket is connected (POSIX.1-2001).

EISDIR Is a directory (POSIX.1-2001).

EISNAM Is a named type file.

EKEYEXPIRED
        Key has expired.

EKEYREJECTED
        Key was rejected by service.

EKEYREVOKED
        Key has been revoked.

EL2HLT Level 2 halted.

EL2NSYNC
        Level 2 not synchronized.

EL3HLT Level 3 halted.

EL3RST Level 3 reset.

ELIBACC
        Cannot access a needed shared library.

ELIBBAD
        Accessing a corrupted shared library.

ELIBMAX
        Attempting to link in too many shared libraries.

ELIBSCN
        .lib section in a.out corrupted

ELIBEXEC
        Cannot exec a shared library directly.

ELNRANGE
        Link number out of range.

ELOOP  Too many levels of symbolic links (POSIX.1-2001).

EMEDIUMTYPE
        Wrong medium type.

EMFILE Too many open files (POSIX.1-2001).  Commonly caused by
        exceeding the RLIMIT_NOFILE resource limit described in
        getrlimit(2).  Can also be caused by exceeding the limit
        specified in /proc/sys/fs/nr_open.

EMLINK Too many links (POSIX.1-2001).

EMSGSIZE
        Message too long (POSIX.1-2001).

EMULTIHOP
        Multihop attempted (POSIX.1-2001).

ENAMETOOLONG
        Filename too long (POSIX.1-2001).

ENETDOWN
        Network is down (POSIX.1-2001).

ENETRESET
        Connection aborted by network (POSIX.1-2001).

ENETUNREACH
        Network unreachable (POSIX.1-2001).

ENFILE Too many open files in system (POSIX.1-2001).  On Linux,
        this is probably a result of encountering the
        /proc/sys/fs/file-max limit (see proc(5)).

ENOANO No anode.

ENOBUFS
        No buffer space available (POSIX.1 (XSI STREAMS option)).

ENODATA
        No message is available on the STREAM head read queue
        (POSIX.1-2001).

ENODEV No such device (POSIX.1-2001).

ENOENT No such file or directory (POSIX.1-2001).  
        Typically, this error results when a specified pathname
        does not exist, or one of the components in the directory
        prefix of a pathname does not exist, or the specified
        pathname is a dangling symbolic link.

ENOEXEC
        Exec format error (POSIX.1-2001).

ENOKEY Required key not available.

ENOLCK No locks available (POSIX.1-2001).

ENOLINK
        Link has been severed (POSIX.1-2001).

ENOMEDIUM
        No medium found.

ENOMEM Not enough space/cannot allocate memory (POSIX.1-2001).

ENOMSG No message of the desired type (POSIX.1-2001).

ENONET Machine is not on the network.

ENOPKG Package not installed.

ENOPROTOOPT
        Protocol not available (POSIX.1-2001).

ENOSPC No space left on device (POSIX.1-2001).

ENOSR  No STREAM resources (POSIX.1 (XSI STREAMS option)).

ENOSTR Not a STREAM (POSIX.1 (XSI STREAMS option)).

ENOSYS Function not implemented (POSIX.1-2001).

ENOTBLK
        Block device required.

ENOTCONN
        The socket is not connected (POSIX.1-2001).

ENOTDIR
        Not a directory (POSIX.1-2001).

ENOTEMPTY
        Directory not empty (POSIX.1-2001).

ENOTRECOVERABLE
        State not recoverable (POSIX.1-2008).

ENOTSOCK
        Not a socket (POSIX.1-2001).

ENOTSUP
        Operation not supported (POSIX.1-2001).

ENOTTY Inappropriate I/O control operation (POSIX.1-2001).

ENOTUNIQ
        Name not unique on network.

ENXIO  No such device or address (POSIX.1-2001).

EOPNOTSUPP
        Operation not supported on socket (POSIX.1-2001).  
        (ENOTSUP and EOPNOTSUPP have the same value on Linux, but
        according to POSIX.1 these error values should be
        distinct.)

EOVERFLOW   Value too large to be stored in data type (POSIX.1-2001).

EOWNERDEAD  Owner died (POSIX.1-2008).

EPERM  Operation not permitted (POSIX.1-2001).

EPFNOSUPPORT    Protocol family not supported.

EPIPE  Broken pipe (POSIX.1-2001).

EPROTO Protocol error (POSIX.1-2001).

EPROTONOSUPPORT
        Protocol not supported (POSIX.1-2001).

EPROTOTYPE
        Protocol wrong type for socket (POSIX.1-2001).

ERANGE Result too large (POSIX.1, C99).

EREMCHG
        Remote address changed.

EREMOTE
        Object is remote.

EREMOTEIO
        Remote I/O error.

ERESTART
        Interrupted system call should be restarted.

ERFKILL
        Operation not possible due to RF-kill.

EROFS  Read-only filesystem (POSIX.1-2001).

ESHUTDOWN
        Cannot send after transport endpoint shutdown.

ESPIPE Invalid seek (POSIX.1-2001).

ESOCKTNOSUPPORT
        Socket type not supported.

ESRCH  No such process (POSIX.1-2001).

ESTALE Stale file handle (POSIX.1-2001).  
        This error can occur for NFS and for other filesystems.

ESTRPIPE
        Streams pipe error.

ETIME  Timer expired (POSIX.1 (XSI STREAMS option)).  
        (POSIX.1 says "STREAM ioctl(2) timeout".)

ETIMEDOUT
        Connection timed out (POSIX.1-2001).

ETOOMANYREFS
        Too many references: cannot splice.

ETXTBSY
        Text file busy (POSIX.1-2001).

EUCLEAN
        Structure needs cleaning.

EUNATCH
        Protocol driver not attached.

EUSERS Too many users.

EWOULDBLOCK
        Operation would block (may be same value as EAGAIN)  
        (POSIX.1-2001).

EXDEV  Improper link (POSIX.1-2001).

EXFULL Exchange full.


## 특이 사항 

많이 하는 실수 

~~~c 
if (somecall() == -1) {
    printf("somecall() failed\n"); 
    if (errno == ...) {...}
}
~~~

*somecall()* 함수의 리턴값이 이미 존재하므로 *errno*는 더 이상 소용이 없다. (예: 이미 [printf(3)]()이 호출되는 시점에 값이 바뀌었을수 있다) 만약 *somecall()* 호출의 결과로서 *errno*의 값이 보존되기를 원한다면, 다음과 같이 처리해야 한다. 

~~~c
if (somecall() == -1) {
    int errsv = errno; 
    printf("somecall() failed\n");
    if (errsv == ...) {...}
}
~~~

POSIX 스레드 API는 에러 발생시 *errno*에 값을 설정하지 않는다. 대신 호출 실패가 발생하면 함수 수행의 리턴값으로 에러 코드를 리턴한다. 이떄 리턴하는 에러 번호는 *errno*에서 사용되는 것과 동일한 의미를 가진다. 

아주 오래된 일부 시스템에서는 <errno.h>에 *errno*가 선언되어 있지 않을수도 있다. 이 경우에는 *errno*를 직접 선언해 주어야 했던 시절이 있다. (예 extern int errno) *하지만 절대 이렇게 하지 마라* 예전에는 필수적이었을지 모르나, 최근의 C 라이브러리에서는 문제가 발생할 수 있기 때문이다. 

## 같이 보기 

*errno(1)*, [err(3)](https://man7.org/linux/man-pages/man3/err.3.html), [error(3)](https://man7.org/linux/man-pages/man3/error.3.html), [perror(3)](https://man7.org/linux/man-pages/man3/perror.3.html), [strerror(3)](https://man7.org/linux/man-pages/man3/strerror.3.html) 


## COLOPHON 

이 페이지는 리눅스 매뉴얼 페이지 프로젝트 5.11 릴리즈의 일부이다. 프로젝트의 상세 설명, 버그 리포트 및 본 페이지의 최신 버전에 대한 정보는 다음의 링크에서 확인할 수 있다.  
[https://www.kernel.org/doc/man-pages/](https://www.kernel.org/doc/man-pages/.)