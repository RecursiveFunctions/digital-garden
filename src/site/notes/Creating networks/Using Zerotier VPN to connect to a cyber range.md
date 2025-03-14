---
{"dg-publish":true,"permalink":"/creating-networks/using-zerotier-vpn-to-connect-to-a-cyber-range/","noteIcon":"","created":"2025-03-12T15:32:51.484-07:00","updated":"2025-03-12T17:08:16.416-07:00"}
---

If you have a network you want to access remotely, you can use a VPN. I've used Zerotier to create cyber ranges for others to connect to and conduct some pentesting exercises. 
1. Download [ZeroTier](https://www.zerotier.com/download/) for your device.
#### Windows
Download and run the installer

#### Linux
enter the following in your terminal
```bash
curl -s http://install.zerotier.com | sudo bash
```

3.  Join the network
##### Windows
On the lower righthand corner in the taskbar, right-click the zerotier icon and click `Join Network`
enter the 16-character Network ID provided by the Network Admin. 

#### Linux
enter the command `sudo zerotier-cli join` followed by the 16-character Network ID
```bash
sudo zerotier-cli join 1234567890abcdef
```


If the network you joined is public, you will automatically be added to the network. If it is private, you will have to wait for the administrator to approve your device.


