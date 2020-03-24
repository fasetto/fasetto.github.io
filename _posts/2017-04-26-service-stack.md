---
layout: post
title: "ServiceStack ile web servis geliştirme"
image: http://fasetto.github.io/assets/images/servicestack-logo-png
author: fasetto
categories: [web-services, rest-api]
tags: [servicestack webservices, restfullservice]
excerpt_separator: <!-- more-->
---

![servicestack-logo]({{ site.baseurl }}/assets/images/servicestack-logo.png)
<br/>
## Nedir bu ServiceStack ?
**WCF** ve **Web API** ye alternatif olarak *cross-platform* olarak kullanabileceğimiz *open-source* bir *web service framework.*
<!-- more-->
<br/> Eğer .Net Framework çatısı altında çalışıyorsanız *WCF* kullanabilirsiniz fakat web servislerinizi *Windows* dışındaki platformlara da dağıtmak istiyorsanız **ServiceStack** ideal bir seçenektir.
<br/> <br/> WCF client ve server arasındaki iletişimi sağlayabilmek için *data contracts (veri sözleşmeleri)* kullanır.
**ServiceStack** bu bakımdan biraz da WCF 'e benzer.
<br/>
Daha fazla bilgi için: __[servicestack.net](http://servicestack.net)__
<br/>
<br/>
# Neden ServiceStack ?
- Kolay olması
- Hızlı olması
- Bizi karmaşık XML configrasyonlarıyla uğraştırmaması
- En önemlisi de cross-platform bir hizmet verebilmemizi sağlıyor olması

gibi avantajları olduğu için tercih edilir.
<br/>

**ServiceStack** *Any, GET, POST, DELETE, PUT* gibi eylemleri destekler. **Any** hem *GET* hem de *POST* istekleri tarafından çağrılabileceği anlamına gelir.
<br/>
![servicestack-httpclients]({{ site.baseurl }}/images/servicestack-httpclients.png)
<br/>

> **ServiceStack** web servisimizi **RESTful** web servise dönüştürmek için *Web request* tanımlarken sınıfımızı `[Route(...)]` attribute ile uygun şekilde işaretlememiz yeterli.
<br/>

Ufak bir örnek ile gösterelim.
<br/> **NuGet** package manager 'da  *ServiceStack* framework 'unu buluyoruz ve projemize ekliyoruz.

{% gist fasetto/78b97aa131288097a3ae27e8fba30ca2 %} <br/>
Burada basitçe **Name** parametresi alan bir *HelloService* oluşturduk. Geriye gördüğünüz üzere `"Hello, $Name"` şeklinde parametreyi döndürüyor.
<br/> *HelloRequest* sınıfına neden `IReturn<HelloResponse>` arayüzünü giydirdiğimizi birazdan açıklayacağım.
<br/><br/>

{% gist fasetto/8f1667ece8a2e61b771a626d18a83ded %}
*AppHost* 'umuzu **AppSelfHostBase** sınıfından türetiyoruz. Ve constructor 'ında ilgili parametreleri veriyoruz.
<br/>

{% gist fasetto/50b77fed75854a34fe1e300726d56b6d %}
Hostumuzu bu şekilde oluşturup başlatıyoruz.
<br/>

{% gist fasetto/eb7172695de754d0365e2974f3998874 %} <br/>

Test projemize aynı şekilde **NuGet** package manager 'dan bu kez *ServiceStack.HttpClient* referansını ekliyoruz.
<br/>
*HelloRequest* sınıfına `IReturn<HelloResponse>` arayüzünü giydirmeseydik kodda yorum satırı olarak geçen: <br/> `string response = client.Get(new HelloRequest { Name = "SERKAN" }).Result;` <br/>
şeklinde bir kullanım yapamazdık.  Çünki `client.Get()` fonksiyonun aldığı parametrelerden biri `IRequest<T>`.
<br/> <br/>

Bu yazımızda buraya kadar.
<br/> Detaylı dokümantasyon için __[docs.servicestack.net](http://docs.servicestack.net)__ adresine göz atabilirsin.

<br/> <br/>
