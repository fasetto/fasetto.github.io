---
layout: post
title:  "Repository pattern ve tipik hatalar"
image: http://fasetto.github.io/assets/images/repository-pattern.png
author: fasetto
categories: [design-patterns, .net, repository-pattern, unit-of-work]
tags: [repositorypattern, entityframework, unitofwork, designpatterns]
excerpt_separator: <!-- more-->
---

![repository-pattern.png]({{ site.baseurl }}/assets/images/repository-pattern.png)
<br/>
Repository pattern bir soyutlamadır. Amaç karışıklığı azaltarak kodun geri kalanını kalıcı kılmaktır.

## Faydaları !
  - Unit testler yazmayı kolaylaştırır.
  - Kodun bakım ve yönetimi kolaylaşır.
  - **CRUD** *(Create, Read, Update, Delete)* işlemlerimizi hızlıca gerçekleştirebiliriz.
<!-- more-->
# Nasıl repository oluşturulur ?
Repository pattern 'ı doğru bir şekilde uygulayabilmek için izlemeniz gereken tek bir kural var.
> Repository sınıfınıza, ihtiyaç duyana kadar **hiç bir şey eklemeyin !**

Geliştiricilerin bir çoğu generic bir repository oluturup, içine ihtiyaç duyabilecekleri tüm fonksiyonları da ekleyerek bunu bir base class olarak kullanırlar. **Bu yanlıştır.**

## Unit of Work
**Unit of work** design pattern 'ı genellikle **repository pattern** ile birlikte kullanılır.
Adından da anlaşılacağı gibi veritabanı işlemlerimizi tek bir kanaldan yürütmemizi sağlar.
<br/> <br/>
Yapılan işlemlerin veritabanına toplu halde kaydedilmesi, herhangi bir hata olması durumunda *rollback* (geri alınması) ya da transaction iptali gibi işlemleri sağlayabiliriz.
{% gist fasetto/acdcd14585eb816d2a6cec9268726749 %}

## Uygulama
Küçük bir örnek ile başlayalım.
{% gist fasetto/d87ddd7524fe8b0f95ddae744b5cf7ad %}

<br/>
Biraz da özelleştirelim.
{% gist fasetto/afb03d684735f392a40576ee4d790dd2 %}

Burada görüldüğü gibi sadece ihtiyacınız olan fonksiyonları oluşturun.
<br/>

## Entity Framework
### Base class (taban sınıf)
{% gist fasetto/e3b482d52a86af98373c00efdad73d1d %}

 <br/>
Oluşturduğumuz taban sınıfımızı daha sonra repository sınıfımıza implement ediyoruz.
{% gist fasetto/23baba9ae403c506d07152c0c47a892f %}

*return* ederken `ToList()`, `FirstOrDefault()` vb. çağrılıncaya kadar sorgu veritabanında *yürütülemez.*
<br/>
**Kullanmayı unutmayın !**

<br/>
### Entity Framework için Unit of Work
{% gist fasetto/dc98aabaae0bc16e1a1ed1e2fc93a50a %}

<br/>
### Final
{% gist fasetto/fc05dfcaf087f05ea93d07725524f23b %}

# Tipik hatalar
## Linq methodlarınızı dışarı açmayın
Eğer linq methodlarınızı açığa vurursanız yani dışarıya açarsanız *(sızıntı)* repository pattern 'ı amacına uygun kullanamamış olursunuz. *Sızıntılı* bir soyutlama elde edersiniz.
Genellikle `IQueryable<T>` ile.
<br/>
Repository pattern yazının en başında da dediğimiz gibi **soyutlamaya (abstraction)** dayanır.

Bunu yapmayın:
{% gist fasetto/a188527916b426f4586f7c8af3dd40c7 %}

> Bu repository sınıfları hiç bir amaca hizmet etmiyor.

## Lazy-loading öğrenin
Eğer bilmiyorsanız [Google](https://www.google.com/search?q=lazy+loading){:target="_blank"}
<br/>
<br/>

