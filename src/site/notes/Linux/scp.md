---
{"dg-publish":true,"permalink":"/linux/scp/"}
---

The syntax for **scp** is very similar to the _cp_ command, except the location of the file will contain _User_@_host_:_remote-file-path_
```bash
scp <user>@<ip>:<filepath> <destination filepath>
#or to upload
scp <source file path> <user>@<ip>:<destination path>
#to upload a remote file to a remote destination
scp <user1@hostA>:<source file path> <user2@hostB>:<destination path>
```
![Pasted image 20221111013910.png](/img/user/Images/Pasted%20image%2020221111013910.png)
![Pasted image 20221111014337.png](/img/user/Images/Pasted%20image%2020221111014337.png)
