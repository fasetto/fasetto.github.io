---
layout: post
title: ".Net MongoDB Kullanımı"
image: http://fasetto.github.io/images/mongodb-logo.png
author: fasetto
categories: [database, mongodb, repository-pattern]
tags: [repositorypattern, mongodb]
excerpt_separator: <!-- more-->
---

![mongodb-logo]({{ site.baseurl }}/assets/images/mongodb-logo.png)
<br/>
## MongoDB
**MongoDB**, *NoSQL* kavramıyla ortaya çıkmış *document-oriented* veri modelini kullanan açık kaynak bir veritabanıdır. <br/>
<!-- more-->
Bu yazımda .Net projelerinizde nasıl **MongoDB** kullanabileceğinizi anlatacağım.

> Bu Makalemde *MongoDB* kurulumuna değinmeyeceğim, kurduğunuzu varsayarak anlatım yapacağım. <br/>
> Bu Makale bulunan kodların proje halini **[buradan](https://github.com/fasetto/mongodb-sample)** indirebilirsiniz.

## MongoDB vs SQL
Aşağıda bazı *SQL* terimlerinin *MongoDB* karşılıklarını görüyorsunuz. <br/>

|    SQL   |   MongoDB  |
|----------|------------|
| database | database   |
| table    | collection |
| column   | field      |
| row      | document   |

<br/>

## MongoDB Driver kurulumu
**MongoDB** bir çok programlama dilini destekler ve bunlar için ayrı *driverları* vardır. <br/>
Bu driverlar uygulamamızın **MongoDB** ile iletişim kurabilmesini sağlar. <br/>
Bu yüzden .Net için olan driverı biz **NuGet** aracılığı ile projemize dahil edeceğiz.

Package Manager Console 'a aşağıdaki kodu yazıp kurabilirsiniz.
> Install-Package MongoDB.Driver -Version 2.4.4

Ya da projenize sağ tıklayıp *Manage NuGet Packages* seçeneğinden MongoDB.Driver yazıp arayarak çıkan pakedi kurabilirsiniz. <br/>
Ben bu makaleyi yazarken kullandığım sürüm *2.4.4* sürümü. Kodlar sürümlere göre farklılık gösterebilir.

## Repository pattern ile örnek uygulama

{% gist fasetto/fd5897892277f23c08f69bc7680777ef %}
{% gist fasetto/e39b2fe656a66f22a8f7fa2650f50ace %}
Burada *entity* sınıfımızı projemize eklediğimiz driverdaki *attributeleri* kullanarak oluşturuyoruz. <br/>
**Id** alanlarını `[BsonId]` diğer alanları ise `[BsonElement(..)]` attribute ile işaretliyoruz. <br/>
**Id** lerimizin tipi ise dikkat ederseniz *ObjectId* türünden. <br/>
Bu şekilde field larımızı attribute ler yardımıyla isimlendirmiş olduk.
<br/> <br/>

{% gist fasetto/66a5e9d52d96f492af60a840ab8cab38 %}
Asenkron bi şekilde repository interface 'imizi de **CRUD** işlemlerimiz için hazırlıyoruz..
<br/> <br/>

{% gist fasetto/939854e9a7c34d9cafd83f1b37ff15ff %}
Context sınıfımızı da yukarıdaki gibi tasarlıyoruz.
Burada dikkatinizi çeken `IMongoDatabase` interface 'i bizim veritabanımızı temsil ediyor. <br/>
`MongoUrl` sınıfını ise bizim connection string 'imiz üzerinden veritabanı adını alabilmemiz için kullandık. <br/> <br/>

{% gist fasetto/5f885e768e0f355a885c81193b64316c %}
**MongoRepository** adında *generic* bir abstract repository sınıfımızı yukarıdaki gibi hazırlıyoruz. <br/>

`IRepository<T>` interface 'imizi de giydiriyoruz sınıfımıza. <br/>
`IMongoCollection<T>` Başta gösterdiğim tablodaki gibi *collection*, SQL karşılığı ile bizim tablolarımızdır diyebiliriz. <br/>

Burada bir de **AddNewAsync** methodumuzu görüyorsunuz. <br/>
*Collection* property 'mizin **InsertOneAsync** methodu ile veritabanımıza ekleme yapıyoruz. <br/> <br/>

{% gist fasetto/765aaea4a672ae78e381c6a51e339a0b %}
Burada açıkçası pek fazla açıklama yapmaya gerek olmadığını düşünüyorum. *MongoRespository* sınıfımızın diğer methodları buradakiler. <br/>
Sorgulama yaparken *(GetByX.. methodlarımızda)* filtreleme yapabilmek için **Builder** sınıfından yararlanıyoruz. Ya da *linq* methodları ile de yapabilirsiniz bunu tabii.
Burada *update* işleminde *linq* kullandık.
<br/> <br/>

{% gist fasetto/e613b124f8b497ecb829ed4108ed954a %}
**UserRepository** 'mizi de oluşturduk. <br/>
`_dataContext.Database.GetCollection<User>("users");` Burada tırnak içinde **"users"** yazdığım yere siz tabiiki kendi koleksiyonunuza vermek istediğiniz adı gireceksiniz.

Buraya kadar tamam. <br/>
Bir de pratik olsun diye *UnitOfWork* yapalım hadi. <br/> <br/>

{% gist fasetto/eaf9cc8de9ccd7da4418ded4e339707c %}
<br/> <br/>

Ve aşağıda da oluşturduğumuz sınıflarımızı kullanarak *CRUD* işlemlerimizi gerçekleştirdiğimiz bir test sınıfımız var.

{% gist fasetto/d8df2fa533183672edc8092763d6f2fb %}

Bir sonraki yazıda görüşmek üzere.
<br/> <br/>
