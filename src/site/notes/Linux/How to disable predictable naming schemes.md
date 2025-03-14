---
{"dg-publish":true,"permalink":"/linux/how-to-disable-predictable-naming-schemes/","noteIcon":"","created":"2025-03-12T17:16:30.013-07:00","updated":"2025-03-14T02:10:52.094-07:00"}
---

There are 3 methods to do so:
## Disable assignment of fixed names
```bash
ln -s /dev/null /etc/systemd/network/99-default.link
```

## Create your own manual naming scheme
you can name your interfaces manually (like `internet0, ``lan0`, etc). Create your own  [.link](`https://www.freedesktop.org/software/systemd/man/systemd.link.html)[🏛️](https://web.archive.org/web/20250314/https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networ [(Archived)](https://web.archive.org/web/20250314/https://www.freedesktop.org/software/systemd/man/systemd.link.html)king-and-services-i/name-resolution/ip-addresses-and-domain-names#fn7) files in `/etc/systemd/network` and choose explicit names for your interfaces or create a whole new naming scheme.

.link files encode configuration for matching network devices. Configuration files are sorted and processed in alphanumeric order. 
>Note: It is best practice to prefix filenames with a number ie `10-eth0.link`

## Pass net.ifnames=0 on the kernel command line
