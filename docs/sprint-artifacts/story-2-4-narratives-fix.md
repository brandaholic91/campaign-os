# Narratives Oszlop Hiba Javítás - Story 2.4

**Dátum:** 2025-11-21  
**Probléma:** "Could not find the 'narratives' column of 'campaigns' in the schema cache"  
**Ok:** A `narratives` oszlop hiányzik a Supabase típusokból és/vagy az adatbázisból

---

## Változtatások

### 1. `lib/supabase/types.ts`

Hozzáadtam a `narratives` mezőt a `campaigns` tábla típusaihoz:

```typescript
campaigns: {
  Row: {
    // ... existing fields ...
    narratives: Json | null  // ← Hozzáadva
    // ... rest of fields ...
  }
  Insert: {
    // ... existing fields ...
    narratives?: Json | null  // ← Hozzáadva
    // ... rest of fields ...
  }
  Update: {
    // ... existing fields ...
    narratives?: Json | null  // ← Hozzáadva
    // ... rest of fields ...
  }
}
```

### 2. `app/api/campaigns/structure/route.ts`

Eltávolítottam a felesleges `as any` cast-ot és javítottam a narratives kezelését:

```typescript
// Előtte:
narratives: structure.narratives as any // Cast to any because column might not exist in types yet
} as any)

// Utána:
narratives: structure.narratives || []
})
```

---

## Migration Futtatása Szükséges

A `supabase/migrations/20251121_add_narratives_to_campaigns.sql` migration fájl létezik:

```sql
-- Add narratives column to campaigns table
ALTER TABLE campaigns ADD COLUMN narratives JSONB DEFAULT '[]'::jsonb;
```

**Fontos:** Ez a migration le kell, hogy fusson az adatbázison!

### Migration Futtatása

Ha Supabase local development:
```bash
npx supabase migration up
```

Ha Supabase cloud:
```bash
# Migration automatikusan fut, vagy manuálisan futtasd a Supabase dashboard-on
```

Vagy manuálisan futtasd az SQL-t:
```sql
ALTER TABLE campaign_os.campaigns ADD COLUMN IF NOT EXISTS narratives JSONB DEFAULT '[]'::jsonb;
```

---

## Ellenőrzés

Ha a hiba továbbra is fennáll:

1. **Ellenőrizd, hogy a migration lefutott-e:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'campaign_os' 
   AND table_name = 'campaigns' 
   AND column_name = 'narratives';
   ```

2. **Ha nincs oszlop, futtasd a migration-t:**
   ```bash
   npx supabase migration up
   ```

3. **Vagy futtasd manuálisan:**
   ```sql
   ALTER TABLE campaign_os.campaigns 
   ADD COLUMN IF NOT EXISTS narratives JSONB DEFAULT '[]'::jsonb;
   ```

---

## Alternatív Megoldás (Ha Migration Nem Lehetséges)

Ha nem lehet futtatni a migration-t, ideiglenesen eltávolíthatod a narratives insert-ot:

```typescript
.insert({
  name: campaign.name,
  description: campaign.description,
  start_date: campaign.startDate,
  end_date: campaign.endDate,
  campaign_type: campaign.campaignType as any,
  primary_goal_type: campaign.goalType as any,
  status: 'planning',
  // narratives: structure.narratives || []  // ← Ideiglenesen kikommentezve
})
```

De ez **nem ajánlott**, mert a narratives fontos adat a campaign struktúrához.

