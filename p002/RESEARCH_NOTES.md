# P002 instrument evidence notes

Last reviewed: 2026-09-17

This file records the evidence boundary for the two questionnaire conditions used in P002. It is not permission to treat the current repository wording as a validated instrument.

## PCL-5

- Source instrument: PTSD Checklist for DSM-5 (PCL-5), VA National Center for PTSD.
- Source status: public domain according to the VA.
- Standard response coding: 0–4.
- P002 target window: past month.
- Published Chinese evidence exists, including:
  - Fung HW, Chan C, Lee CY, Ross CA. *Using the Post-traumatic Stress Disorder (PTSD) Checklist for DSM-5 to Screen for PTSD in the Chinese Context: A Pilot Study in a Psychiatric Sample*. DOI: 10.1080/26408066.2019.1676858.
- The wording currently in this repository is a prototype paraphrase and is **not asserted to be the exact validated Chinese wording**.

## CAPE-P15 / Current CAPE-15

- Current CAPE-15 source:
  - Capra C, Kavanagh DJ, Hides L, Scott JG. *Current CAPE-15: a measure of recent psychotic-like experiences and associated distress*. DOI: 10.1111/eip.12245.
  - The current form was evaluated for recent (3-month) psychotic-like experiences.
- Chinese psychometric validation:
  - Sun M, Wang D, Jing L, Xi C, Dai L, Zhou L. *Psychometric properties of the 15-item positive subscale of the community assessment of psychic experiences*. DOI: 10.1016/j.schres.2020.06.003.
  - This validation studied Chinese college students across lifetime and past-month frames.
- Published Chinese applications describe frequency codes as **1 = never** through **4 = nearly always**, with distress also coded **1–4**.
- P002 therefore preserves 1–4 response codes in stored questionnaire events. If an analysis needs zero-based values, recoding must happen explicitly downstream and must not be described as the source instrument's original coding.
- The repository wording is still a construct-based prototype paraphrase. Do not use it as a validated Chinese CAPE-P15 without obtaining/freezing the intended Chinese instrument wording and permissions.

## Scenario condition

The `scenario` condition transforms item wording and response format. It is an experimental signal condition, not a PCL-5 or CAPE-P15 score-equivalent form. Any construct mapping requires pilot evidence before inferential use.

## Formal collection gate

Before `formal_data_collection_authorized` can become true:

1. freeze the exact target-language wording for both instruments;
2. record source / permission status;
3. freeze response codes and scoring transformations;
4. freeze item ordering and condition logic;
5. record a version hash for instrument assets;
6. complete ethics / consent / withdrawal / data-governance review;
7. validate the transformed scenario condition separately.
