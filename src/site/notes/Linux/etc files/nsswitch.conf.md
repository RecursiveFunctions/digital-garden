---
dg-publish: true
---
The order of name resolution is handled by the [_/etc/nsswitch.conf](https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn6) [🏛️](https://web.archive.org/web/20250314/https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn6) 

```bash nums {13}
kali@kali:~$ cat /etc/nsswitch.conf
# /etc/nsswitch.conf
#
# Example configuration of GNU Name Service Switch functionality.
# If you have the `glibc-doc-reference' and `info' packages installed, try:
# `info libc "Name Service Switch"' for information about this file.
#service        how it's handled


passwd:         files systemd
group:          files systemd
shadow:         files
gshadow:        files

hosts:          files mdns4_minimal [NOTFOUND=return] dns
networks:       files

protocols:      db files
services:       db files
ethers:         db files
rpc:            db files

netgroup:       nis
```


example: `hosts` is handled first by local files, then [[Linux/mdns4_minimal\|mdns4_minimal]], then DNS


