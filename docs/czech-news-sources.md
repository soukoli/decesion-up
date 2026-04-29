# Czech News Sources Research

## Tier 1: Nejvíce důvěryhodné zdroje (Veřejná média)

### 1. **Česká televize (ČT24)**
- **URL**: https://ct24.ceskatelevize.cz/rss/hlavni-zpravy
- **Důvěryhodnost**: 95%
- **Typ**: Veřejnoprávní médium
- **Pokrytí**: Domácí i zahraniční zprávy
- **Aktualizace**: Kontinuální (24/7)

### 2. **Český rozhlas (iROZHLAS)**
- **URL**: https://www.irozhlas.cz/rss
- **Důvěryhodnost**: 95%
- **Typ**: Veřejnoprávní rádio
- **Pokrytí**: Domácí i zahraniční zprávy, analýzy
- **Aktualizace**: Kontinuální

## Tier 2: Etablované zpravodajské servery

### 3. **Novinky.cz**
- **URL**: https://www.novinky.cz/rss
- **Důvěryhodnost**: 80%
- **Typ**: Komerční zpravodajský server
- **Pokrytí**: Široké spektrum zpráv
- **Aktualizace**: Velmi častá

### 4. **iDNES.cz**
- **URL**: https://servis.idnes.cz/rss.aspx?c=zpravodaj
- **Důvěryhodnost**: 75%
- **Typ**: Komerční zpravodajský server (MF Dnes)
- **Pokrytí**: Domácí i zahraniční zprávy
- **Aktualizace**: Velmi častá

### 5. **Aktuálně.cz**
- **URL**: https://www.aktualne.cz/rss/
- **Důvěryhodnost**: 80%
- **Typ**: Nezávislý zpravodajský server
- **Pokrytí**: Domácí i zahraniční zprávy, analýzy
- **Aktualizace**: Častá

## Tier 3: Specializované zdroje

### 6. **Deník N**
- **URL**: https://denikn.cz/rss
- **Důvěryhodnost**: 85%
- **Typ**: Předplacené kvalitní žurnalistika
- **Pokrytí**: Analitické články, investigativa
- **Aktualizace**: Denní

### 7. **Seznam Zprávy**
- **URL**: https://www.seznamzpravy.cz/rss
- **Důvěryhodnost**: 75%
- **Typ**: Komerční zpravodajský server
- **Pokrytí**: Domácí i zahraniční zprávy
- **Aktualizace**: Častá

## Doporučená konfigurace pro DecisionUp

### Primární zdroje (vysoká důvěryhodnost):
1. **ČT24** - nejdůvěryhodnější, veřejnoprávní
2. **iROZHLAS** - kvalitní analýzy, veřejnoprávní
3. **Aktuálně.cz** - nezávislé, kvalitní zpravodajství

### Sekundární zdroje (pro doplnění):
4. **Novinky.cz** - rychlé zprávy
5. **Seznam Zprávy** - alternativní pohled

### Kategorie pro český obsah:
- **domaci** - české domácí zprávy
- **politika** - české politické zprávy  
- **ekonomika** - české ekonomické zprávy
- **region** - regionální zprávy
- **kultura** - kulturní zprávy

## Technické poznámky:

### RSS Feed struktura:
- Všechny zdroje používají standardní RSS 2.0
- Obsahují: title, link, description, pubDate, category
- Některé mají dodatečné metadata (author, enclosure)

### Rate limiting:
- ČT24: Bez omezení pro RSS
- iROZHLAS: Bez omezení pro RSS
- Komerční: Doporučeno max 1 request/minute

### Fallback strategie:
Pokud RSS nedostupné → použij záložní zdroj ze stejné kategorie

---

**Implementační doporučení**: Začít s ČT24 + iROZHLAS jako primární zdroje, postupně přidat ostatní podle potřeby.