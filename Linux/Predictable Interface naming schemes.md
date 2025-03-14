---
dg-publish: true
dg-home:
---
By default, `systemd v197` will name interfaces using the following naming schemes in this order. If the information from the firmware is not available, it will go down the list. 

1. Names with firmware/BIOS provided index numbers for onboard devices (like `eno1`)
2.  Names with firmware/BIOS provided PCI Express hot plug slot index numbers (like `ens1`)
3. Names with physical/geographical location of the connector of the hardware (`enp2s0`)
4. classic (`eth0`)
-----
5. Names with the interface's MAC address (`enx78e7d1ea46da`) 
This last one is not used by default, but is available if the user chooses so.

`biosdevname` and user-added `udev` rules take precedence over this naming scheme. any distro-specific naming schemes (ie Kali) generally take precedence.

## Benefits of this naming scheme
- The interface names are fully predictable, i.e. just by looking at lspci you can figure out what the interface is going to be called
 - Fully stateless operation, changing the hardware configuration will not result in changes in `/etc`
 - Stable interface names even if you have to replace broken ethernet cards by new ones
 - Stable interface names even when hardware is added or removed, i.e. no re-enumeration takes place (to the level the firmware permits this)

## Cons
* You have to look at the local interface names (`ifconfig` or `ip link`) to invoke commands on them instead of assuming eth0 was the right name.

| **Prefix** | **Description**<br>                |
| ---------- | ---------------------------------- |
| ib         | infiniband                         |
| sl         | Serial Line IP (slip)              |
| wl         | Wireless local area network (WLAN) |
| ww         | wireless wide area network (WWAN)  |

| **format**          | **description**        |
| ------------------- | ---------------------- |
| prefix + o + number | PCI onboard index      |
| prefix + d + number | Devicetree alias index |

## Examples
### PCI Ethernet card with firmware index "1"
```bash
ID_NET_NAME_ONBOARD=eno1
ID_NET_NAME_ONBOARD_LABEL=Ethernet Port 1
```

### PCI Ethernet card in hot plug slot with firmware index number
```bash
# /sys/devices/pci0000:00/0000:00:1c.3/0000:05:00.0/net/ens1
ID_NET_NAME_PATH=enp5s0

```
### PCI Ethernet multi-function card with 2 ports
```bash
# /sys/devices/pci0000:00/0000:00:1c.0/0000:02:00.0/net/enp2s0f0
ID_NET_NAME_PATH= enp2s0f0

# /sys/devices/pci0000:00/0000:00:1c.0/0000:02:00.1/net/enp2s0f1
ID_NET_NAME_PATH=enp2s0f1
```
### PCI WLAN card
`wl p 3 s 0`
```bash
# /sys/devices/pci0000:00/0000:00:1c.1/0000:03:00.0/net/wlp3s0
ID_NET_NAME_PATH=wlp3s0
```

## USB built-in 3G modem
```
# /sys/devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.4/2-1.4:1.6/net/wwp0s29u1u4i6
ID_NET_NAME_PATH=wwp0s29u1u4i6

ID_NET_LABEL_ONBOARD=*prefix label*
set based on textual label given by the firmware for on-board devices. The name consists of the prefix concatenated with the label. Only available for PCI devices.

ID_NET_NAME_MAC=prefixxAABBCCDDEEFF
prefix + "x" + MAC. available if the device has a **fixed** mac address. remains stable when the device is moved (even between machines) but changes when the hardware is replaced.



```

