# ChainOSC Chain Device Runtime Semantics v1

## Scope

This document defines user-visible runtime behavior shared by Angle, Joystick, and ToF in M5ChainOSC, ChainOSCmini, and ChainOSCnano. Device Preset formats and Web UI layout are specified separately.

## Terminology

### Runtime baseline

The most recent valid sample used as the reference for Minimum Change comparison. The storage mechanism is implementation-defined.

### Minimum Change

The minimum absolute change from the runtime baseline required to send an OSC message. It is not a centre dead zone.

## Angle

The configured Resolution SHALL select either 8-bit input (0 through 255) or 12-bit input (0 through 4095).

When a valid Angle input becomes available, the first successfully read sample SHALL establish the runtime baseline and SHALL NOT send an OSC message.

While the baseline is valid, a sample SHALL satisfy abs(current - baseline) >= Minimum Change to send. A sample that meets this condition SHALL replace the runtime baseline.

The input SHALL be mapped from the active Resolution range to the configured Output Min and Output Max. Mapping and numeric conversion details are implementation-defined.

Changing Resolution SHALL invalidate the runtime baseline, both for normal setting changes and Device Preset Import. The first valid sample after invalidation SHALL establish the new baseline and SHALL NOT send an OSC message.

Saving without changing Resolution SHALL preserve the runtime baseline.

## Joystick

The X and Y axes SHALL be treated as independent inputs. Each axis has its own OSC Address and runtime baseline, while the configured Minimum Change value applies to both axes.

The first valid X and Y sample SHALL establish the respective baselines and SHALL NOT send X or Y OSC messages.

For each axis independently, a sample SHALL satisfy abs(currentAxis - baselineAxis) >= Minimum Change to send.

When only X satisfies the condition, only X SHALL be sent and only the X baseline SHALL be updated. When only Y satisfies the condition, only Y SHALL be sent and only the Y baseline SHALL be updated. When both satisfy the condition, both axes SHALL be sent. Implementations SHOULD send X before Y when both are sent.

Invert X and Invert Y SHALL be applied to their respective axes before mapping to Output Min and Output Max.

Joystick Push SHALL support the configured Press/Release or Sequence behavior. Its detailed message representation is defined by the Device Preset specification.

## ToF

ToF distances SHALL be expressed in millimetres. A distance is valid only when 30 <= distance < maxDistanceMm.

The upper bound is exclusive; a distance equal to maxDistanceMm is invalid.

An out-of-range value SHALL NOT send an OSC message and SHALL invalidate the runtime baseline.

When no valid runtime baseline exists and the first valid distance is obtained, that distance SHALL be sent as an OSC message and SHALL establish the new runtime baseline. This applies at startup or connection and after re-entering the valid range.

While the baseline is valid, a sample SHALL satisfy abs(current - baseline) >= Minimum Change to send. A sample that is sent SHALL replace the runtime baseline. Minimum Change is expressed in millimetres.

The valid distance SHALL be mapped to Output Min and Output Max according to the configured Output Direction, including Near-to-Out-Min and Near-to-Out-Max choices.

## Product-specific behavior outside this specification

The following are informative implementation details and are not part of the shared runtime contract:

- Port 2 physical-orientation correction for Joystick raw X/Y values in ChainOSCmini and ChainOSCnano
- Measurement polling intervals, read timeouts, and retry counts
- Internal ToF reinitialization strategy
- Whether range validation is enforced during save/import or at runtime
- Baseline variable names, types, and storage locations
- Source-level class, function, and polling-loop structure
- Legacy ToF String-to-Float compatibility normalization in M5ChainOSC

These implementation details are outside the shared runtime contract and are not represented by the current Device Preset format.
