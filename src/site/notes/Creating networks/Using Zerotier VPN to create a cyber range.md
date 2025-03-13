---
{"dg-publish":true,"permalink":"/creating-networks/using-zerotier-vpn-to-create-a-cyber-range/"}
---

1. Create an account at [Zerotier.com](https://www.my.zerotier.com/ )
2. Create a network and give it a name
 ![Pasted image 20221111151933.png](/img/user/Images/Pasted%20image%2020221111151933.png)
3. Add the devices that are part of the range and the devices that will access the range. Some considerations:
	* At the minimum you should add the first machine of the network that users will interact with. In my network, this would be the Kali AP set up in the network in case users don't have their own kali instance to work with.
	* You can add other machines in the practice range for ease of remotely troubleshooting them directly. Do not share the zerotier IP addresses of these machines unless you want users to directly access them
	* Inform users that these zerotier interfaces are out-of-bounds and not part of the cyber range. Otherwise they may get confused and waste time enumerating these interfaces.
* Label each device in the zerotier web GUI  to easily identify them. 

Users can [[Creating networks/Using Zerotier VPN to connect to a cyber range\|connect to the range]] themselves using zerotier as well.

Give users at least one entry point into the network, like an [[Creating networks/starting an SSH server\|SSH Server]] on one of the target machines
