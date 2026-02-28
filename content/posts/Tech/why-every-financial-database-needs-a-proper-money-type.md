---
title: "Why Every Financial Database Needs a Proper MONEY Type"
date: 2026-02-28T14:00:00+09:00
draft: false
comments: true
authors:
  - younjinjeong
tags: [database, data-engineering, fintech, type-system, postgresql, system-design, finops, Cloud]
categories: [Tech]
layout: "post"
---

*A deep dive into one of the most overlooked problems in financial systems engineering -- and a concrete solution.*

---

I've been building a system that calculates enterprise costs, and at some point the question hit me: why not build a database system perfectly suited for this work? So I started building one as a side project, together with AI -- a purpose-built database system designed from the ground up for financial and cost management workloads.

That's when a deceptively simple question stopped me cold.

**"Why is there no dedicated data type for money?"**

The more I researched, the more I found that the approaches most engineers rely on today carry subtle but serious risks -- risks that compound silently across millions of records until they become impossible to ignore. This post documents what I found, and the design I arrived at.

---

## The Problem Today

### Floating-Point Is the Wrong Tool

When engineers need to store a monetary value, the instinctive choice is `FLOAT` or `DOUBLE`. It makes intuitive sense: money has decimal places, and floating-point types handle decimals. Problem solved.

Except it isn't.

`FLOAT` and `DOUBLE` use [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) binary floating-point representation. Binary floating-point **cannot exactly represent most decimal fractions**. The number `0.1` stored as an IEEE 754 double is actually:

```
0.1000000000000000055511151231257827021181583404541015625
```

This is not an approximation -- it is the [exact value stored in memory](https://docs.python.org/3/tutorial/floatingpoint.html). IEEE 754 binary64 values contain 53 bits of precision. The computer converts `0.1` to the closest fraction of the form J/2^N where J is an integer containing exactly 53 bits. Since 1/10 is a repeating fraction in binary (0.00011001100110011...), it cannot be represented exactly with finite bits.

This means:

```python
>>> 0.1 + 0.2 == 0.3   # False
>>> 0.1 + 0.2           # 0.30000000000000004
```

In isolation, this looks harmless. But in a financial system processing billions of billing records, this error **does not stay small**. Each arithmetic operation introduces a rounding error at the last significant bit. Aggregate those errors across hundreds of millions of records and you get financial discrepancies that are real, non-trivial, and often very difficult to trace back to their source.

The failure mode is particularly dangerous because it is **silent**. No exception is raised. No warning is logged. The database happily returns a number that is almost correct -- and "almost correct" in financial systems means incorrect.

### The Existing MONEY Type Nobody Uses

PostgreSQL has had a built-in [`money` type](https://www.postgresql.org/docs/current/datatype-money.html) for decades. Yet the PostgreSQL community consensus is clear: avoid it for new applications. The official documentation itself warns about its locale sensitivity and conversion pitfalls. The reasons reveal exactly what a correct MONEY type needs to look like.

**Problem 1: Locale dependency**

The output formatting of PostgreSQL's `money` type is controlled by the server's [`lc_monetary`](https://www.postgresql.org/docs/current/locale.html) setting -- a server-level configuration. The documentation warns explicitly:

> *"Since the output of this data type is locale-sensitive, it might not work to load money data into a database that has a different setting of lc_monetary."*

Change the server locale, migrate to a different database instance, or run the same application in a different region, and your financial data becomes difficult to move safely. In a multi-region or multi-tenant cloud environment, this is not a theoretical risk. It is a deployment waiting to go wrong.

**Problem 2: No per-column precision**

The `money` type internally stores values as 64-bit integers representing cents (or the minor currency unit of the server's locale). The scale is fixed by the locale -- you cannot define different precision for different columns. You cannot have a USD column with 2 decimal places and a KRW column with 0 decimal places in the same database.

This matters because different currencies have fundamentally different precision requirements. [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) defines the minor unit relationship for each currency:

| Currency | ISO 4217 Minor Unit | Decimal Places | Example |
|----------|---------------------|----------------|---------|
| KRW (Korean Won) | 0 | 0 | W 1,234 |
| USD (US Dollar) | 2 | 2 | $12.34 |
| BHD ([Bahraini Dinar](https://en.wikipedia.org/wiki/Bahraini_dinar)) | 3 | 3 | 1.234 BD |
| BTC (Bitcoin) | -- | 8 | 0.00100000 BTC |

A single locale-determined precision setting cannot serve all of these correctly.

**Problem 3: Limited type conversion**

Converting PostgreSQL's `money` type to `numeric` is possible via direct cast (`money_value::numeric`), but the reverse path and interactions with floating-point types are fraught with risk. The documentation specifically warns: *"Conversion from the real and double precision data types can be done by casting to numeric first, for example `'12.34'::float8::numeric::money`. However, this is not recommended."* This kind of friction at type boundaries creates bugs exactly where financial systems can least afford them.

**Problem 4: Currency is not part of the value**

PostgreSQL's `money` type stores a number. Nothing more. There is no concept of USD vs. KRW baked into the value itself. A column named `cost` could contain dollars, won, or yen -- and the type system has nothing to say about it.

This is a structural problem. The moment currency identity is separated from the amount, you depend entirely on developer discipline to keep them together. In large codebases, across many teams and years, that discipline fails.

### The Common Workarounds and Their Limits

The PostgreSQL community recommends two alternatives:

**`NUMERIC(12, 2)` / `DECIMAL`**: Exact decimal arithmetic, no floating-point error. Widely used and reasonable. But `NUMERIC` does not know it is money. It does not know its currency. The database will let you add a USD column to a KRW column and return a number -- a meaningless number -- without complaint.

**`BIGINT` storing minor units (e.g., cents)**: Space-efficient, fast integer arithmetic. But this pushes the entire conceptual model into the application layer. The database has no idea what the integer represents. Currency conversion, scale management, and display formatting all become application responsibilities, and they must be handled consistently across every service that touches the data.

Both workarounds move correctness **out of the database and into developer convention**. In a system that will be maintained by many engineers over many years, convention is a weak guarantee.

---

## The Proposed Solution: A Native MONEY Type

The solution is to define `MONEY` as a first-class native type in the database engine -- one that encodes everything that is intrinsic to a monetary value and nothing that is extrinsic.

### What a MONEY Value Intrinsically Is

A monetary value has exactly three properties that are inseparable from it:

1. **The amount** -- a precise decimal number
2. **The currency** -- which unit of account the amount is denominated in
3. **The scale** -- how many decimal places are meaningful for that currency

Everything else -- exchange rates, rounding policy, display format -- is context that arrives from outside the value. These belong outside the type.

### Internal Representation

```
MONEY {
    value    : INT128    // scaled integer -- no floating point
    currency : CHAR(3)   // ISO 4217 currency code (USD, KRW, EUR, ...)
    scale    : UINT8     // decimal places, 0-18
}
```

**Why a scaled integer?**

The `value` field stores the amount as an integer with the decimal point implicit. This is the same principle behind Java's [`BigDecimal`](https://docs.oracle.com/javase/8/docs/api/java/math/BigDecimal.html) and Python's [`decimal.Decimal`](https://docs.python.org/3/library/decimal.html) -- an unscaled integer value plus a scale factor. The amount `$12.34` with an internal scale of 8 is stored as:

```
value    = 1234000000
currency = "USD"
scale    = 8
```

All arithmetic operates on integers. Integer arithmetic is exact. There is no IEEE 754, no rounding at intermediate steps, no accumulated error. The precision of the result is determined by the scale, not by hardware floating-point representation.

**Why INT128 and not INT64?**

At first glance, [INT64](https://en.wikipedia.org/wiki/Integer_(computer_science)#Common_integral_data_types) (maximum value: 9,223,372,036,854,775,807, or ~9.2 x 10^18) appears more than sufficient. But consider currency conversion at scale:

```
1 Billion USD  x  KRW exchange rate 1,350  x  10^8 (internal scale)
= 1,000,000,000  x  1,350  x  100,000,000
= 1.35 x 10^20
```

INT64 maximum is ~9.2 x 10^18. **The conversion already overflows.** This is not a hypothetical -- it is arithmetic. At an enterprise billing scale of tens of billions of USD, with KRW, JPY, and IDR conversions applied at full internal precision, INT64 is structurally insufficient.

[INT128](https://en.wikipedia.org/wiki/128-bit_computing) (maximum ~1.7 x 10^38) provides headroom for any realistic currency conversion, any aggregation accumulator, at any foreseeable scale.

**Why ISO 4217?**

[ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) is the international standard for currency codes. It defines not only the three-letter alphabetic code (USD, KRW, EUR, JPY) but also the number of minor units -- the decimal relationship between the major and minor currency unit. Binding the currency code to the value itself -- not to the column, not to the table, but to the value -- means that every MONEY value carries its own identity. A USD value and a KRW value are not just different numbers; they are different types of thing, and the engine treats them that way.

### Type-Safe Arithmetic

With currency embedded in the value, the engine can enforce arithmetic rules at the type system level:

```sql
-- Allowed: same currency
MONEY(100.00, 'USD') + MONEY(50.00, 'USD')    -- => MONEY(150.00, 'USD') [OK]
MONEY(100.00, 'USD') * 1.1                    -- => MONEY(110.00, 'USD') [OK]
MONEY(100.00, 'USD') / 4                      -- => MONEY(25.00, 'USD')  [OK]

-- Rejected: different currencies
MONEY(100.00, 'USD') + MONEY(100.00, 'KRW')
-- ERROR: MONEY arithmetic requires matching currency (USD != KRW) [ERR]

-- Rejected: MONEY * MONEY (dimensionally invalid)
MONEY(100.00, 'USD') * MONEY(2.00, 'USD')
-- ERROR: MONEY * MONEY is not a valid operation [ERR]

-- Rejected: implicit cast from float
INSERT INTO costs (amount) VALUES (12.34)
-- ERROR: implicit cast from FLOAT to MONEY not allowed;
--        use MONEY(12.34, 'USD') constructor explicitly [ERR]
```

The dimensional analysis here follows the same logic as physical units. Dollars times a scalar yields dollars. Dollars plus dollars yields dollars. But dollars times dollars yields "square dollars" -- which is not a meaningful unit. This is analogous to how a type system for [dimensional analysis](https://en.wikipedia.org/wiki/Dimensional_analysis) works in physics: the type system prevents operations that produce dimensionally meaningless results.

Cross-currency errors are caught **at plan time** when the currency is statically known from column definitions -- before any data is read. When currency is determined dynamically at runtime, the error is caught at execution time. Either way, the incorrect operation never produces a result.

### Storage Layout

**Row store (OLTP):** 24 bytes per value, fixed-width.

```
[0..15]  : INT128 value      (16 bytes)
[16..18] : CHAR(3) currency  (3 bytes)
[19]     : UINT8 scale       (1 byte)
[20..23] : padding/flags     (4 bytes)
```

**Column store (OLAP):** Decomposed into three sub-columns for maximum compression.

```
value_col    : INT128 column  -- delta encoded (high compression on sequential billing data)
currency_col : CHAR(3) column -- dictionary encoded (typically 2-5 distinct values per table)
scale_col    : UINT8 column   -- run-length encoded (constant within a currency column)
```

This decomposition enables predicate pushdown on `currency` alone -- for example, filtering all USD records -- without decoding the `value` column. In OLAP workloads scanning billions of billing records, this is a significant I/O reduction. This approach is similar to how columnar engines like [Apache Parquet](https://parquet.apache.org/) and [ClickHouse](https://clickhouse.com/docs/en/sql-reference/data-types) decompose composite types for storage efficiency.

---

## What Changes When You Add This Type to a Database

### The Database Becomes the Source of Truth for Correctness

With `NUMERIC` or `BIGINT`, the database stores numbers. The meaning of those numbers -- what currency, what scale, what rounding rules apply -- lives in application code, documentation, and convention.

With a native MONEY type, the database stores money. The meaning is in the data itself. Any service that reads a MONEY value knows its currency and scale without consulting external documentation or trusting that application developers followed the convention.

This is not a small shift. It means:

- **Data migrations become safer.** Moving data between systems preserves currency identity automatically.
- **Bugs are caught earlier.** A cross-currency addition fails at query planning, not in a production reconciliation report.
- **Onboarding is faster.** New engineers cannot accidentally misuse monetary columns because the type system prevents the most common mistakes.
- **Audit trails are cleaner.** Every stored value is self-describing.

### Aggregate Functions Work Correctly by Default

```sql
-- SUM across a homogeneous currency column: works, returns MONEY
SELECT app_id, SUM(net_cost) FROM billing_line_items
WHERE usage_date = '2025-03-31'
GROUP BY app_id;

-- SUM across a mixed-currency column: fails with a clear error
-- rather than silently returning a meaningless number
SELECT SUM(net_cost) FROM billing_line_items;
-- ERROR: SUM on mixed-currency MONEY column requires explicit conversion
```

The second query fails loudly instead of silently returning a number that means nothing. This is the correct behavior -- and it is only possible when the database knows the column contains multiple currencies.

### Performance Characteristics

The 24-byte fixed-width storage is larger than a bare `DECIMAL` or `BIGINT`. The tradeoff is explicit and deliberate:

- Compared to `(amount DECIMAL, currency CHAR(3))` -- two columns totaling comparable storage -- the MONEY type has no overhead and eliminates the structural separation between amount and currency.
- In column store with dictionary encoding on the currency sub-column, the effective storage overhead is minimal: the currency dictionary typically contains 2-5 entries, and each row stores only a 1-2 byte index.
- The INT128 arithmetic is slightly slower than INT64 on current hardware. On modern 64-bit CPUs, INT128 is typically emulated as two 64-bit operations -- approximately 2x the cost of INT64 for basic arithmetic. For aggregation workloads that are memory- or I/O-bound (which is almost all OLAP workloads at scale), this difference is not the bottleneck.

---

## Additional Considerations

### Exchange Rate Policy

The MONEY type deliberately does not embed exchange rates. This is a feature, not a limitation.

Exchange rates are extrinsic to a monetary value. They are:

- **Time-dependent** -- the same USD/KRW rate is different today than it was yesterday
- **Source-dependent** -- the [Bank of Korea](https://www.bok.or.kr/) rate, [ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) rate, and market spot rate for the same currency pair on the same day are different numbers
- **Contract-dependent** -- in an MSP environment, different customers may have contractually agreed to different FX rates for their billing

Embedding exchange rates in the type would make the type a policy carrier, not a value carrier. Instead, the recommended pattern is a `CONVERT()` function that receives the exchange rate as an explicit parameter:

```sql
CONVERT(
    money          MONEY,
    target         CHAR(3),    -- target currency
    rate           DECIMAL,    -- exchange rate, supplied by caller
    rounding_mode  ENUM        -- supplied by caller
) -> MONEY
```

The caller -- whether application code, a billing pipeline, or a query -- supplies the rate. The database function applies it precisely. The source of the rate, the date it applies to, and any contract-specific adjustments remain in the layer that knows about those things.

### Rounding Policy

Neither the MONEY type nor the `CONVERT()` function should have a hardcoded rounding policy. Rounding is a business decision, not a mathematical one.

There is no international accounting standard ([IFRS](https://www.ifrs.org/) or [GAAP](https://fasb.org/)) that mandates a single specific rounding direction. The choice depends on jurisdiction, contract terms, and business context. Common approaches include:

| Policy | Description | Typical use |
|--------|-------------|-------------|
| HALF_UP | Round 0.5 upward | General purpose, most common |
| HALF_DOWN | Round 0.5 downward | Customer-favorable billing |
| [HALF_EVEN](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even) | Round 0.5 to nearest even digit (Banker's rounding) | Statistical fairness over large datasets |
| TRUNCATE | Discard fractional part | Conservative cost accounting |

The recommended approach: define `HALF_DOWN` (customer-favorable) as the default for billing-facing functions, `HALF_UP` for internal cost accounting, and expose `rounding_mode` as an explicit parameter on any function that performs division or currency conversion. This makes rounding decisions visible and auditable rather than hidden in implementation details.

### Handling NULL

`NULL` is a valid MONEY value and follows standard [SQL null semantics](https://en.wikipedia.org/wiki/Null_(SQL)). A null MONEY value does not mean "zero dollars" -- it means "no value recorded." Financial systems that conflate `NULL` and zero create reconciliation problems. The type enforces this distinction at the storage level.

### Cryptocurrency and Non-Standard Currencies

The v1 implementation targets ISO 4217 currencies only. Cryptocurrencies and other non-standard instruments introduce additional complexity:

- **Variable scale**: [Bitcoin](https://en.bitcoin.it/wiki/Units) requires 8 decimal places (1 BTC = 10^8 satoshi); some DeFi tokens use 18 decimal places
- **Volatility**: Exchange rates change at sub-second frequency
- **Non-standard codes**: BTC, ETH are not part of the ISO 4217 standard

These can be accommodated in a future version by extending the `currency` field or by defining a separate `CRYPTO_MONEY` type. The core design -- scaled integer + currency code + scale -- extends naturally to higher precision by increasing the internal scale parameter.

### What This Type Does Not Solve

Being explicit about scope prevents misuse:

- **It does not store exchange rate history.** That belongs in a dedicated `fx_rates` table.
- **It does not enforce accounting rules.** Double-entry bookkeeping, chart of accounts, and period close logic are application concerns.
- **It does not handle currency display formatting.** Locale-aware rendering (symbol placement, thousands separators) belongs in the presentation layer.
- **It does not validate that a transaction makes business sense.** A negative `net_cost` is a valid MONEY value; whether it represents a valid credit memo is a business rule.

---

## Summary

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| Floating-point errors in aggregation | IEEE 754 cannot represent decimal fractions exactly | INT128 scaled integer arithmetic |
| Silent currency mixing | Amount stored without currency identity | Currency bound to value as ISO 4217 code |
| Global precision settings | No per-column scale in existing `money` type | Per-column immutable `scale` attribute |
| Locale-dependent behavior | `lc_monetary` server setting | No locale dependency in type definition |
| Application-layer correctness burden | Database stores numbers, not money | Database enforces currency-safety at type level |
| INT64 overflow on FX conversion | Insufficient range for converted amounts at scale | INT128 -- overflow is provable, not hypothetical |

The right abstraction for money has always been clear: an exact amount, a known currency, and a defined scale -- bound together, enforced by the database system, not by convention.

Building it as a native type inside a purpose-built database system means the guarantee holds everywhere the data goes -- across every query, every service, every migration.

---

*This design is being implemented as part of a new database system built from the ground up for financial workloads -- a purpose-built engine that treats money as a first-class concern at every layer, from type system to storage to query execution. The formal type specification is available as a structured engineering Epic for implementation reference.*

---

## References

- [IEEE 754 -- Wikipedia](https://en.wikipedia.org/wiki/IEEE_754) -- The floating-point standard and why binary cannot represent decimal fractions exactly
- [Floating-Point Arithmetic: Issues and Limitations -- Python Documentation](https://docs.python.org/3/tutorial/floatingpoint.html) -- Authoritative explanation of why `0.1 + 0.2 != 0.3`
- [PostgreSQL Monetary Types Documentation](https://www.postgresql.org/docs/current/datatype-money.html) -- Official docs on PostgreSQL's `money` type and its limitations
- [ISO 4217 -- Currency Codes](https://www.iso.org/iso-4217-currency-codes.html) -- The international standard for currency identification and minor units
- [ISO 4217 -- Wikipedia](https://en.wikipedia.org/wiki/ISO_4217) -- Comprehensive list of currency codes, numeric codes, and minor unit definitions
- [Bahraini Dinar -- Wikipedia](https://en.wikipedia.org/wiki/Bahraini_dinar) -- Example of a 3-decimal-place currency
- [Rounding Half to Even (Banker's Rounding) -- Wikipedia](https://en.wikipedia.org/wiki/Rounding#Rounding_half_to_even) -- The rounding method used for statistical fairness
- [Java BigDecimal](https://docs.oracle.com/javase/8/docs/api/java/math/BigDecimal.html) -- Scaled integer approach to exact decimal arithmetic in Java
- [Python decimal Module](https://docs.python.org/3/library/decimal.html) -- Python's implementation of exact decimal arithmetic
- [Bitcoin Units -- Bitcoin Wiki](https://en.bitcoin.it/wiki/Units) -- Bitcoin's 8-decimal-place (satoshi) precision
