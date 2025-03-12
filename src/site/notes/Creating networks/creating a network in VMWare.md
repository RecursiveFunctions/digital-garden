---
{"dg-publish":true,"permalink":"/creating-networks/creating-a-network-in-vm-ware/"}
---

For all Virtual Machines (VMs) in the range, make sure their Network adapters are in the same virtual network. You can check this in VMWare by going to `VM` > `Settings` > `Network Adapter`

![Pasted image 20221103181525.png](/img/user/Images/Pasted%20image%2020221103181525.png)
![Pasted image 20221103181646.png](/img/user/Images/Pasted%20image%2020221103181646.png)

VMs that will be reached directly by [ZeroTier](https://www.zerotier.com/product/) will need an additional interface to connect to the internet. Click `Add` and select `Network Adapter`. Set it to `NAT` and save changes.
![Pasted image 20221103182252.png](/img/user/Images/Pasted%20image%2020221103182252.png)

You'll have to manually configure each VM's routing table to connect to each other.
For example, for a cyber range with 3 linux machines in the `192.168.1.0/24` network, you might do something like this:
#### VM1
```bash
sudo su
ip a add 192.168.1.1/24 dev eth0
```

#### VM2
```bash
sudo su
ip a add 192.168.1.2/24 dev eth0

```

## VM3
```shell
sudo su
ip a add 192.168.1.3/24 dev eth0
```

ping devices on the network to confirm that they're connected
```shell
#from VM1
ping 192.168.1.2
ping 192.168.1.3
```

If you want to be able to ssh into each box, [enable the ssh server](obsidian://open?vault=Cyber&file=Creating%20networks%2Fstarting%20an%20SSH%20server) on each one.

