---
{"dg-publish":true,"dg-path":"Linux/etc files/sshd_config","permalink":"/linux/etc-files/sshd-config/","noteIcon":"","created":"2025-03-17T16:52:16.183-04:00","updated":"2025-03-20T01:08:06.268-04:00"}
---

Note that this is not the /etc/ssh/ssh_config file. The /etc/ssh/sshd_config file is for the ssh daemon process (the server process), whereas the /etc/ssh/ssh_config[3](https://portal.offensive-security.com/courses/pen-100/books-and-videos/modal/modules/linux-networking-and-services-i/ssh,-scp,-sshpass/remote-connections-with-secure-shell#fn3) configuration file is for the ssh client.

* can change port for ssh
 after making changes to the file, restart the ssh service daemon
 `sudo systemctl restart ssh`
