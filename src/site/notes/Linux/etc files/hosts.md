---
{"dg-publish":true,"permalink":"/linux/etc-files/hosts/","noteIcon":"","created":"2025-03-12T17:16:30.016-07:00","updated":"2025-03-14T01:44:41.422-07:00"}
---

 the _/etc/hosts_ file can be [configured to manage name resolutions](https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn5) [🏛️](https://web.archive.org/web/20250314/https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn5). The following listing displays the default /etc/hosts file configuration.
 ```bash
kali@kali:~$ cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       kali
```

```bash nums {4}
kali@kali:~$ cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       kali
10.124.17.10    FileShare
```
With the host entry added, instead of typing the IP address to the file server, the human-readable word 'FileShare' can be used to access it, like so:
```bash
ssh user@FileShare
```

The order of name resolution is handled by the [nsswitch.conf](https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn6) [🏛️](https://web.archive.org/web/20250314/https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn6) (Name Service Switch) file.
