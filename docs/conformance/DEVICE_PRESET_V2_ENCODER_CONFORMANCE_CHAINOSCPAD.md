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
part of the common Device Preset v2 test assets, but v1-to-v2 migration
conformance is outside the scope of this record.

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

## 7. Migration Status

Migration fixtures are maintained as part of the common Device Preset v2
test assets.

However, **v1-to-v2 Migration conformance is not asserted by this
ChainOSCPad conformance record**.

Migration fixtures and migration behavior should be evaluated and
recorded separately when formal product-level migration conformance is
established.

No migration PASS count should be inferred from this document.

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
| v1-to-v2 Migration conformance | Outside this record's scope | NOT ASSERTED |

Overall result for the tested Device Preset v2 Encoder scope:

``` text
PASS
```

No known Device Preset v2 Encoder semantic mismatch remains between the
normative specification, common test assets, and the ChainOSCPad
implementation for the tested scope.

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
