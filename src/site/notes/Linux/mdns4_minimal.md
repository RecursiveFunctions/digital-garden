---
dg-publish: true
---
The [_mdns4_minimal_](https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/name-resolution/ip-addresses-and-domain-names#fn7) entry is a multicast DNS resolver that will auto-populate entries with a _.local_ TLD. If there isn't a relevant search ending with _.local_, it will move on to the normal DNS search. Knowing this, the related service should first reference the [[Linux/etc files/hosts\|/etc/]] file.