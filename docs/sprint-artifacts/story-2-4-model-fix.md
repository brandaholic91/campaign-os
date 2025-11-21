# Model Konfiguráció Javítás - Story 2.4

**Dátum:** 2025-11-21  
**Probléma:** `claude-3-5-sonnet-20241022` model nem található (404 error)  
**Megoldás:** Model konfiguráció környezeti változóval

---

## Változtatások

### 1. `app/api/ai/campaign-brief/route.ts`
- **Előtte:** `model: 'claude-3-5-sonnet-20241022'` (2 helyen)
- **Utána:** `model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'`
- **Helyek:** Brief Normalizer és Strategy Designer

### 2. `app/api/ai/message-matrix/route.ts`
- **Előtte:** `model: 'claude-3-5-sonnet-20241022'`
- **Utána:** `model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'`

### 3. `lib/ai/copilotkit/server.ts`
- **Előtte:** `model: 'claude-haiku-4-5'` (hardcoded)
- **Utána:** `model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'`
- Console.log is frissítve

### 4. `docs/tech-spec.md`
- **Előtte:** `Model: claude-3-5-sonnet-20241022 or latest`
- **Utána:** `Model: Configurable via ANTHROPIC_MODEL env var, defaults to claude-haiku-4-5`

---

## Használat

### Alapértelmezett (claude-haiku-4-5)
Nincs szükség környezeti változóra, automatikusan `claude-haiku-4-5`-öt használ.

### Egyedi model beállítása
```bash
# .env.local vagy .env
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
# vagy
ANTHROPIC_MODEL=claude-opus-20240229
# vagy bármilyen más Anthropic model
```

---

## Előnyök

1. **Flexibilis:** Könnyen váltani lehet model-t környezeti változóval
2. **Konzisztens:** Minden AI endpoint ugyanazt a model-t használja
3. **Költséghatékony:** Alapértelmezett `claude-haiku-4-5` olcsóbb, mint Sonnet
4. **Tesztelhető:** Könnyen váltani lehet dev/prod model-ek között

---

## Tesztelés

A hiba (`404 model: claude-3-5-sonnet-20241022`) most már nem jelentkezik, mert:
- Alapértelmezett `claude-haiku-4-5` használatban van
- Ha `ANTHROPIC_MODEL` be van állítva, azt használja
- Ha a beállított model nem elérhető, a környezeti változó módosítható

