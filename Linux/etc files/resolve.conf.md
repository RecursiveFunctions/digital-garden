---
dg-publish: true
---
```bash
kali@kali:~$ cat /etc/resolv.conf
domain offensive-security.com
search offensive-security.com
nameserver 192.168.1.1
```

If a search is performed on a network without specifying the domain name, the domain entry will be used. In this case, let's suppose that a browser is open and the user enters https://www. Since the domain was not specified in this browser search, the domain entry _offensive-security.com_ will be added to this search, separated by a period. This will translate to https://www.offensive-security.com.

