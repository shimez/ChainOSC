# Device Preset v2 Encoder Conformance Record --- ChainOSCPad

## Test Metadata

| Item | Value |
|---|---|
| Test date | 2026-09-05 |
| ChainOSC specification commit | `93e06edacbb8179e7cbc94acad8caf69ee176f6f` |
| ChainOSC branch | `main` |
| ChainOSCPad version | `1.0.2` |
| ChainOSCPad commit | `9ddea3301e7a43566a0562881a04c58b22edacac` |
| ChainOSCPad branch | `feature/device-preset-v2-encoder` |
| Hardware | ChainOSCPad / XIAO ESP32S3 |
| PlatformIO environment | `xiao_esp32s3` |

### P7 Device Preset v1 Compatibility Closure Metadata

| Item | Value |
|---|---|
| Closure date | 2026-09-08 |
| ChainOSC Source of Truth HEAD | `b781b28ea0d9fb68d36896845f48f66a4d76d287` |
| Explicit Legacy-to-V2 Migration specification commit | `9652814bf1ffa867873aeeec36a831f84a6dc312` |
| ChainOSCPad version | `1.0.3` |
| ChainOSCPad branch | `main` |
| P6 implementation commit | `772c7c93c045ab2ced06ad804005acd2d08631ab` |
| P6 Physical E2E evidence commit | `84db40c03fa77cd4cce5a78ce29d27de49af3d1b` |
| P6 Physical E2E hardware | ChainOSCPad / XIAO ESP32C5 |
| P6 PlatformIO environment | `xiao_esp32c5` |
| P6 browser | Microsoft Edge 152 |

## 1. Purpose

This document records the conformance verification of the ChainOSCPad
Encoder implementation against the ChainOSC Device Preset v2
specification.

ChainOSCPad is used as the initial reference implementation for Device
Preset v2 Encoder semantics.

This document is a test record, not a normative specification. The
normative definition is `DEVICE_PRESET_FORMAT_V2.md`.

------------------------------------------------------------------------

## 2. Scope

Product:

-   ChainOSCPad

Target device:

-   Built-in rotary encoder

Reference specification and validation assets:

-   `DEVICE_PRESET_FORMAT_V2.md`
-   `schemas/chainosc-device-preset-v2.schema.json`
-   `DEVICE_PRESET_ERROR_REGISTRY_V1.md`
-   `test-data/device-presets-v2/canonical/`
-   `test-data/device-presets-v2/valid/`
-   `test-data/device-presets-v2/invalid/`
-   Encoder runtime vectors under `test-data/device-presets-v2/`

Migration fixtures under `test-data/device-presets-v2/migration/` are
part of the common Device Preset v2 test assets. This record asserts the
product-level Device Preset v1 compatibility established by the P3--P6
implementation and verification work. Import-time lossless migration,
non-lossless Legacy preservation, and explicit migration of a persisted
Legacy setting are treated as distinct behaviors.

The following Device Preset v2 device types are outside the scope of
this record:

-   Angle
-   ToF
-   Joystick

Key fixtures are included where they exercise common Device Preset or
OSC validation rules, but this record primarily establishes Encoder v2
conformance.

------------------------------------------------------------------------

## 3. Verification Layers and Evidence

Verification was performed using three distinct forms of evidence.

### 3.1 Common Fixture Validation

The common validation tooling was used to verify:

-   JSON Schema constraints
-   ChainOSC semantic validation represented by the test tooling
-   valid/invalid fixture expectations
-   `expected-errors.json` consistency

These results establish the consistency of the common specification/test
assets. They do **not** mean that every fixture was individually
submitted to a physical ChainOSCPad through its WebUI.

### 3.2 ChainOSCPad Implementation Review

The ChainOSCPad Importer and Encoder runtime implementation were
compared directly with the normative specification, fixture
expectations, and runtime vectors.

This included review of:

-   Importer validation behavior
-   expected Error Registry mappings
-   Amount and Direction runtime behavior
-   reset semantics
-   output conversion behavior

The common runtime vectors are not currently executed automatically
against the embedded C++ implementation. Runtime conformance in this
record therefore means direct implementation-to-vector comparison,
supplemented by build verification and targeted physical hardware tests.

### 3.3 Physical Hardware End-to-End Verification

A physical ChainOSCPad using XIAO ESP32S3 was used for targeted
end-to-end verification.

The tested path was:

``` text
Device Preset JSON
        ↓
WebUI Import
        ↓
ChainOSCPad Importer
        ↓
Encoder Settings
        ↓
Physical Encoder Input
        ↓
Encoder Runtime
        ↓
OSC Output
```

Seven representative hardware tests were executed. The complete
valid/invalid fixture set was not individually submitted to the physical
device.

Additional P6 lifecycle verification was later performed on XIAO
ESP32C5 against implementation commit `772c7c9`. Its completed evidence
is fixed by ChainOSCPad commit `84db40c` and is summarized in Section
9.1. The original seven-test XIAO ESP32S3 evidence remains unchanged.

------------------------------------------------------------------------

## 4. Common Device Preset Fixture Results

### 4.1 Valid Fixtures

Common fixture validation result:

``` text
15 / 15 PASS
```

The common validation tooling accepted all 15 valid fixtures.

Covered cases include:

-   canonical Key v2
-   canonical Encoder Amount
-   Encoder Direction Float
-   Encoder Direction Int
-   Encoder Direction String
-   `rangeSteps = 1`
-   `rangeSteps = 65535`
-   `clockwiseIncreases = false`
-   Amount Int output
-   Amount String output
-   asymmetric Direction values
-   Press + Release total count boundary
-   Sequence with `start == end`
-   Sequence `type = 1` with fractional `start` / `end` / `step`
-   float32-representable Int output boundary

ChainOSCPad's actual Importer implementation was separately reviewed
against these acceptance conditions and no semantic mismatch was
identified.

### 4.2 Invalid Fixtures

Common fixture validation result:

``` text
23 / 23 PASS
```

The common validation tooling rejected all 23 invalid fixtures according
to their expected conditions.

Covered cases include:

-   invalid `rangeSteps`
-   missing required fields
-   invalid field types
-   Amount / Direction field mixing
-   invalid `rotationMode`
-   invalid `outputType`
-   legacy `clickMode` in Device Preset v2
-   `outputMin == outputMax`
-   `outputMin > outputMax`
-   float32 mapping overflow
-   Int output overflow / underflow
-   Press + Release total count overflow
-   Sequence `step = 0`
-   invalid Sequence direction

ChainOSCPad's actual Importer implementation was separately reviewed
against these rejection conditions and no rejection/acceptance mismatch
was identified.

------------------------------------------------------------------------

## 5. Error Registry Verification

Common fixture / expected-error consistency:

``` text
23 / 23 PASS
```

All 23 invalid fixtures are associated with the expected registered
ChainOSC Device Preset error codes in the common test assets.

The ChainOSCPad Importer implementation was directly compared with those
expected mappings. No remaining Error Registry mismatch was identified.

During conformance preparation, one test expectation was corrected:

``` text
Incorrect:
E_MESSAGE_COUNT_EXCEEDED

Correct:
E_OSC_MESSAGE_COUNT_EXCEEDED
```

The ChainOSCPad implementation already used the registered
`E_OSC_MESSAGE_COUNT_EXCEEDED` code correctly.

This 23 / 23 result is based on common fixture/error validation plus
direct source-level comparison with the ChainOSCPad Importer. It does
not represent 23 individual invalid-preset submissions to physical
hardware.

------------------------------------------------------------------------

## 6. Encoder Runtime Vector Verification

The common Encoder runtime vector set contains 14 cases.

For ChainOSCPad:

``` text
Applicable Encoder runtime vectors: 12 / 12 PASS
Non-applicable Chain Encoder vectors: 2 N/A
```

No semantic mismatch was identified between the 12 applicable runtime
vectors and the ChainOSCPad implementation.

Verified semantics include:

-   Amount Wrap includes both endpoints
-   Amount Stop does not retain hidden overshoot
-   Stop endpoint input resends the endpoint OSC value
-   `clockwiseIncreases = false`
-   multi-Step delta magnitude preservation
-   Amount Int half-away-from-zero rounding
-   Amount String fixed three-decimal formatting
-   Amount String negative-zero normalization
-   Direction uses only the sign of delta
-   Direction sends one event regardless of delta magnitude
-   Direction String values are literal
-   active Amount semantic changes reset `logicalPosition`
-   changing to Amount Mode resets `logicalPosition`
-   reset itself sends no OSC
-   inactive Direction settings do not reset Amount `logicalPosition`

### 6.1 Reset Implementation

ChainOSCPad uses a delayed/lazy reset implementation.

A semantic setting change updates the Encoder setting revision.
`logicalPosition` is reset when the next Encoder input is processed.

This conforms to Device Preset v2 because the externally observable
behavior is:

``` text
setting change
    ↓
no OSC output
    ↓
next Encoder Step
    ↓
logical position starts from 0
    ↓
the Step is applied using the new settings
    ↓
OSC output
```

The common runtime vectors verify observable semantics rather than
requiring a particular internal reset timing.

### 6.2 Non-applicable Chain Encoder Cases

The following two runtime cases are intended for externally connected
Chain Encoders and are not applicable to the fixed built-in Encoder of
ChainOSCPad:

-   `RECONNECT-BASELINE-PRESERVES-AMOUNT-POSITION`
-   `DIFFERENT-UID-RESETS-AMOUNT-POSITION`

ChainOSCPad uses a fixed product-internal logical Encoder identity.

These two cases are therefore classified as N/A rather than failures.

------------------------------------------------------------------------

## 7. Device Preset v1 Compatibility

Device Preset v1 compatibility is asserted using the common migration
manifest, the ChainOSCPad P3--P6 implementation history, source review,
build verification, and physical E2E evidence. This assertion does not
mean that every valid v1 preset is converted automatically to V2.

Relevant ChainOSCPad implementation history:

| Phase | Commit | Evidence represented |
|---|---|---|
| P3 | `e70eb89` | Device Preset v1 validation and Import classification |
| P4 | `8625ac5` | Legacy Encoder runtime compatibility |
| P5 | `281f7b3` | Model-aware Device Preset Export |
| P6 | `772c7c9` | Legacy WebUI and explicit Legacy-to-V2 migration |
| P6 E2E | `84db40c` | Recorded physical E2E verification |

### 7.1 v1 Validation and Import Classification

The common migration manifest defines eight cases with these expected
outcomes:

``` text
v2-migration: 1
legacy-import: 6
import-error: 1
```

| Case | Expected and verified result |
|---|---|
| `MIG-AMOUNT-STOP-ZERO-BASED` | `v2-migration` |
| `MIG-AMOUNT-ZERO-BASED` | `legacy-import` |
| `MIG-AMOUNT-OFFSET` | `legacy-import` |
| `MIG-AMOUNT-FRACTIONAL-SPAN` | `legacy-import` |
| `MIG-DIRECTION-FLOAT-CLAMP` | `legacy-import` |
| `MIG-DIRECTION-INT-ROUND` | `legacy-import` |
| `MIG-DIRECTION-STRING` | `legacy-import` |
| `MIG-V1-INVALID-SEQUENCE-STEP-ZERO` | `import-error` / `E_SEQUENCE_STEP_ZERO` |

Result:

``` text
8 / 8 PASS
```

The valid lossless case is imported as the V2 model. Each valid but
non-lossless case is imported as the Legacy model with its v1 values and
semantics preserved. The invalid v1 case is rejected before migration;
it does not fall back to Legacy and does not modify the existing state.

### 7.2 Legacy Runtime and Persistence

The Legacy model preserves the historical ChainOSCPad Encoder behavior,
including absolute-input range and offset, half-open Legacy Wrap,
multi-Step Increment behavior, output conversion, and Push settings.

Model-aware storage preserves the Legacy/V2 discriminator and
model-specific fields across save and reboot. An ordinary Save of a
Legacy setting remains Legacy and does not implicitly promote it to V2.

Result:

``` text
PASS
```

### 7.3 Model-aware Export

Export follows the persisted model:

``` text
Persisted Legacy -> Device Preset v1
Persisted V2     -> Device Preset v2
```

An unsaved explicit-migration candidate is not a persisted V2 model and
therefore does not change the Export boundary; Export remains Device
Preset v1 until the candidate is saved successfully.

Result:

``` text
PASS
```

### 7.4 Explicit Legacy-to-V2 Migration

Explicit migration from a persisted Legacy setting is separate from the
Import-time `v2-migration` classification. It begins only after an
explicit user action and creates an editable, volatile V2 candidate.

Candidate creation and editing do not change the persisted Legacy model,
active Legacy runtime, or Export format. Cancel and validation failure
preserve Legacy. Legacy-to-V2 promotion occurs only after an explicit,
valid Save and storage readback succeed.

The migration UI covers non-lossless Legacy cases without representing
them as lossless. Exact values are copied where possible, deterministic
suggestions are identified as candidates, and unresolved V2 values such
as a fractional `rangeSteps` conversion require user input.

Result:

``` text
PASS
```

### 7.5 Post-migration V2 Behavior

After successful explicit migration, the V2 model, runtime, persistence,
and Device Preset v2 Export behavior apply. Physical verification covered
inclusive-endpoint Amount Wrap, V2 Export, and reboot restoration.

Result:

``` text
PASS
```

------------------------------------------------------------------------

## 8. Build Verification

Target:

-   XIAO ESP32S3

Result:

``` text
PASS
```

The ChainOSCPad firmware successfully completed the PlatformIO build
after the Device Preset v2 Encoder implementation and conformance
review.

The exact PlatformIO environment used for the recorded verification must
be entered in the Test Metadata section.

### 8.1 v1 Compatibility Build Coverage

The P3 compatibility verification recorded successful PlatformIO builds
for XIAO ESP32S3, ESP32C3, and ESP32C6. A contemporaneous ESP32C5
automation attempt encountered the known Windows toolchain error code 5,
rather than a source compilation error. The final P6 implementation
was subsequently built, uploaded, and exercised successfully on physical
XIAO ESP32C5 hardware as recorded by the P6 evidence commit.

------------------------------------------------------------------------

## 9. Physical Hardware End-to-End Test

A physical ChainOSCPad using XIAO ESP32S3 was tested.

Result:

``` text
7 / 7 PASS
```

These are targeted representative end-to-end tests. They are not a claim
that all 15 valid and 23 invalid common fixtures were individually
submitted to the physical device.

### HW-01 --- Valid Amount Preset Import

Procedure:

1.  Import a valid Encoder Amount Device Preset v2 through the WebUI.
2.  Rotate the physical Encoder.
3.  Observe OSC output.

Expected:

-   Import succeeds.
-   Encoder rotation produces OSC according to the imported settings.

Result:

``` text
PASS
```

### HW-02 --- Amount Wrap

Settings:

``` text
rangeSteps = 4
outputMin = 0.0
outputMax = 1.0
wrap = true
```

Expected clockwise sequence:

``` text
0.25
0.50
0.75
1.00
0.00
```

Result:

``` text
PASS
```

### HW-03 --- Amount Stop and Endpoint Resend

Settings:

``` text
rangeSteps = 4
outputMin = 0.0
outputMax = 1.0
wrap = false
```

Expected sequence near the upper endpoint:

``` text
0.75
1.00
1.00
1.00
```

Additional Encoder Steps beyond the endpoint remain valid input events
and resend the endpoint OSC value.

Result:

``` text
PASS
```

### HW-04 --- Increase Direction

Setting:

``` text
clockwiseIncreases = false
```

Expected:

-   clockwise rotation decreases the logical value
-   counter-clockwise rotation increases the logical value

Result:

``` text
PASS
```

### HW-05 --- Amount String Output

Settings:

``` text
rangeSteps = 4
outputMin = 0.0
outputMax = 1.0
outputType = String
```

Expected output includes:

``` text
"0.250"
"0.500"
"0.750"
"1.000"
```

Result:

``` text
PASS
```

### HW-06 --- Failed Import Atomicity

Procedure:

1.  Apply a valid preset.
2.  Confirm normal Encoder operation.
3.  Attempt to import an invalid preset.
4.  Operate the Encoder again.

Expected:

-   invalid preset is rejected
-   the previously valid settings remain active
-   subsequent Encoder behavior remains unchanged

Result:

``` text
PASS
```

This confirms, for the tested invalid-import case, the Device Preset
requirement that a failed import does not partially modify the active
configuration.

### HW-07 --- Semantic Setting Change Reset

Initial example state:

``` text
rangeSteps = 4
outputMin = 0.0
outputMax = 1.0

logical position before change = 3
output = 0.750
```

The setting is then changed to:

``` text
rangeSteps = 10
```

Expected:

1.  The setting change itself sends no OSC.
2.  The next clockwise Encoder Step starts from reset position 0.
3.  That Step moves the logical position to 1.
4.  The resulting output is:

``` text
0.100
```

The old logical position must not continue as:

``` text
0.400
```

Result:

``` text
PASS
```

This confirms that the ChainOSCPad lazy-reset implementation is
externally equivalent to the normative Device Preset v2 reset semantics
for the tested setting change.

### 9.1 P6 Legacy Compatibility and Explicit Migration E2E

The detailed P6 evidence is recorded in
`ChainOSCPad_P6_Physical_E2E_Test_Procedure.md` at ChainOSCPad evidence
commit `84db40c03fa77cd4cce5a78ce29d27de49af3d1b`. The implementation under
test is commit `772c7c93c045ab2ced06ad804005acd2d08631ab`.

Recorded results:

| P6 verification group | Result |
|---|---|
| Main Functional / State / Persistence | 9 / 9 PASS |
| Additional Candidate Coverage | 3 / 3 PASS |
| Fixed Encoder WebUI Visual / Interaction | 10 / 10 PASS |
| Overall P6 Physical E2E | PASS |

The independent P6 review result was `PASS WITH FINDINGS`, with no
BLOCKING findings and a recommendation that P6 be treated as COMPLETE.
The findings concerned only evidence-document traceability and an unused
template table; they do not weaken the recorded functional or UI results.

The evidence covers Legacy Import and runtime, ordinary Legacy Save,
candidate creation, Cancel, invalid candidate Save, successful explicit
migration, post-migration V2 runtime and Export, reboot persistence,
non-lossless candidate examples, responsive layout, and one-shot
navigation/scroll behavior.

------------------------------------------------------------------------

## 10. Final Result

| Verification layer | Evidence | Result |
|---|---|---|
| Common valid fixtures | Common fixture validation tooling | 15 / 15 PASS |
| Common invalid fixtures | Common fixture validation tooling | 23 / 23 PASS |
| Expected Error Registry codes | Common assets + ChainOSCPad source comparison | 23 / 23 PASS |
| Applicable Encoder runtime vectors | ChainOSCPad implementation comparison | 12 / 12 PASS |
| Chain Encoder-specific runtime vectors | Not applicable to built-in Encoder | 2 N/A |
| PlatformIO XIAO ESP32S3 build | Build verification | PASS |
| Physical hardware E2E tests | XIAO ESP32S3 hardware | 7 / 7 PASS |
| v1 validation and Import classification | Common migration manifest + ChainOSCPad P3 evidence | 8 / 8 PASS |
| Lossless v1 to V2 Import | `MIG-AMOUNT-STOP-ZERO-BASED` | 1 / 1 PASS |
| Non-lossless v1 to Legacy Import | Six Legacy-preservation cases | 6 / 6 PASS |
| Invalid v1 rejection | Invalid Sequence case | 1 / 1 PASS |
| Legacy runtime / persistence | P4 verification + P6 Physical E2E | PASS |
| Legacy Device Preset v1 Export | P5 implementation + P6 Physical E2E | PASS |
| Explicit Legacy to V2 migration | P6 implementation and Physical E2E | PASS |
| Post-migration V2 behavior | P6 Physical E2E | PASS |
| P6 Fixed Encoder WebUI | Encoder Fixed Reference + Physical E2E | 10 / 10 PASS |
| Independent P6 review | No BLOCKING findings | PASS WITH FINDINGS / P6 COMPLETE |

Overall result for the tested Device Preset v2 Encoder scope:

``` text
PASS
```

No known Device Preset v2 Encoder or asserted Device Preset v1
compatibility mismatch remains between the normative specification,
common test assets, and the ChainOSCPad implementation for the tested
scope.

This result must be interpreted together with the verification-method
distinctions and limitations recorded in this document.

------------------------------------------------------------------------

## 11. Reference Implementation Status

Based on the verification recorded above, ChainOSCPad is designated as
the initial reference implementation for ChainOSC Device Preset v2
Encoder semantics.

This designation means that ChainOSCPad has been verified against the
normative specification and common conformance assets using the evidence
described in this record.

It does **not** mean that other ChainOSC products must copy the
ChainOSCPad internal implementation.

Other implementations may use different:

-   hardware input processing
-   persistence formats
-   internal state representation
-   reset timing
-   product-specific architecture

provided that their externally observable behavior conforms to
`DEVICE_PRESET_FORMAT_V2.md` and the common conformance tests.

Future implementations such as M5ChainOSC, ChainOSCmini and ChainOSCnano
should therefore be evaluated against the specification and common test
assets rather than against ChainOSCPad source code itself.

------------------------------------------------------------------------

## 12. Known Test Infrastructure Limitations

### 12.1 No Embedded C++ Runtime Vector Runner

The common runtime vectors are not currently executed directly against
the ChainOSCPad embedded C++ implementation by an automated runner.

Runtime conformance was established by:

-   common runtime vector review
-   direct comparison with the corresponding ChainOSCPad implementation
-   successful firmware build
-   targeted physical hardware end-to-end testing

A future automated embedded/runtime conformance runner may improve
regression detection, but is not required for the conformance result
recorded here.

### 12.2 Common Fixtures Are Not Full Physical-Hardware Test Runs

The common valid and invalid fixture counts are results of the common
fixture validation tooling.

The ChainOSCPad Importer was reviewed against those fixture
expectations, but all 38 fixtures were not individually submitted
through the WebUI to physical hardware.

The physical-device evidence in this record is limited to the seven
targeted E2E tests documented in Section 9.

### 12.3 Commit Metadata Must Be Frozen

This record is reproducible using the exact ChainOSC and ChainOSCPad
commits, branches, version, and PlatformIO environment recorded in the
Test Metadata section.

If the specification, fixtures, runtime vectors, or product
implementation later change, a new or updated conformance record should
identify the new revision explicitly.
