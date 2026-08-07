import type { IPhysioScenario } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------
// Hand-authored seed cases. Shaped so a future teacher-authoring UI
// (mirroring src/sections/scenarios) could produce these directly.
// ----------------------------------------------------------------------

const SHOULDER_IMPINGEMENT: IPhysioScenario = {
  id: 'physio-shoulder-impingement',
  region: 'shoulder',
  problemCode: 'SHOULDER_IMPINGEMENT',
  personaName: 'Marcus',
  personaSystemPrompt:
    'You are Marcus, a 45-year-old house painter with insidious-onset right lateral shoulder pain that ' +
    'has been building over 3 months, worse with overhead work. Answer subjective questions in plain, ' +
    'non-clinical language. Never volunteer a diagnosis or use medical jargon.',
  presentingComplaint: 'Right shoulder pain for about 3 months, worse when painting ceilings or reaching overhead.',
  openingLine:
    "Hi, thanks for seeing me. My right shoulder's been aching for a few months now, especially when I " +
    'reach up to paint ceilings. It\'s starting to really get in the way of work.',
  subjectiveScript: [
    {
      keywords: ['onset', 'start', 'begin', 'how long'],
      reply:
        "It came on gradually, no specific injury I can point to. I first noticed it maybe 3 months ago, " +
        "just a dull ache after a long day. It's gotten steadily worse since.",
    },
    {
      keywords: ['worse', 'aggravat', 'trigger'],
      reply:
        'Definitely worse with anything overhead -- painting ceilings, reaching into cupboards. Also bothers ' +
        'me when I lie on that side at night.',
    },
    {
      keywords: ['better', 'eas', 'relie', 'rest'],
      reply: 'Resting it helps, and keeping my arm below shoulder height. Ibuprofen takes the edge off too.',
    },
    {
      keywords: ['pain scale', 'how bad', 'rate', 'severity', 'out of 10'],
      reply: "I'd say a 6 out of 10 at its worst, maybe a 2 or 3 at rest.",
    },
    {
      keywords: ['numbness', 'tingl', 'pins and needles'],
      reply: 'No, nothing like that. Just a deep ache in the shoulder, doesn\'t travel down my arm.',
    },
    {
      keywords: ['weak', 'weakness', 'drop', 'strength'],
      reply: "It does feel weaker when I try to lift things overhead, like I don't have full power there.",
    },
    {
      keywords: ['night', 'sleep'],
      reply: "Yeah, it wakes me up if I roll onto that shoulder. I've started sleeping on my left side.",
    },
    {
      keywords: ['injury', 'fall', 'trauma', 'accident'],
      reply: "No, nothing like that. It just crept up on me over time -- probably all the overhead painting.",
    },
    {
      keywords: ['fever', 'unwell', 'weight loss', 'night sweats'],
      reply: "No, I feel fine otherwise. No fevers, no weight loss, nothing like that.",
    },
    {
      keywords: ['bladder', 'bowel', 'saddle'],
      reply: "That's an odd question for a shoulder! No, nothing like that at all.",
    },
    {
      keywords: ['job', 'work', 'occupation'],
      reply: "I'm a house painter, been doing it for 20 years. Lots of overhead reaching, as you can imagine.",
    },
  ],
  fallbackReply: "Hmm, I'm not sure how to answer that one -- can you ask it a different way?",
  testBank: [
    {
      id: 'shoulder-neer',
      name: "Neer's test",
      category: 'special_test',
      region: 'shoulder',
      briefInstruction: 'Passively raise the arm into forced flexion with the scapula stabilized.',
      relevantToHypotheses: ['subacromial impingement', 'rotator cuff tendinopathy'],
      expectedResult: 'positive',
      resultDetail: 'Pain reproduced at end-range forced flexion, around 160°.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'shoulder-hawkins',
      name: 'Hawkins-Kennedy test',
      category: 'special_test',
      region: 'shoulder',
      briefInstruction: 'Passively flex the shoulder and elbow to 90°, then internally rotate.',
      relevantToHypotheses: ['subacromial impingement', 'rotator cuff tendinopathy'],
      expectedResult: 'positive',
      resultDetail: 'Sharp pain on internal rotation, consistent with subacromial impingement.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'shoulder-empty-can',
      name: "Empty-can (Jobe's) test",
      category: 'special_test',
      region: 'shoulder',
      briefInstruction: 'Resist shoulder abduction at 90° in the scapular plane, thumbs pointing down.',
      relevantToHypotheses: ['rotator cuff tendinopathy', 'supraspinatus tear'],
      expectedResult: 'positive',
      resultDetail: 'Pain and mild weakness resisting abduction in the "empty can" position.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'shoulder-drop-arm',
      name: 'Drop-arm test',
      category: 'special_test',
      region: 'shoulder',
      briefInstruction: 'Passively abduct the arm to 90° and ask the patient to slowly lower it.',
      relevantToHypotheses: ['full-thickness rotator cuff tear'],
      expectedResult: 'negative',
      resultDetail: 'Able to lower the arm smoothly and control it through range -- argues against a full-thickness tear.',
      romDegrees: null,
      painResponse: 'mild',
    },
    {
      id: 'shoulder-rom-flexion',
      name: 'ROM: shoulder flexion',
      category: 'rom',
      region: 'shoulder',
      briefInstruction: 'Measure active shoulder flexion range with a goniometer.',
      relevantToHypotheses: ['subacromial impingement', 'adhesive capsulitis'],
      expectedResult: 'positive',
      resultDetail: 'Painful arc between roughly 80° and 120°; full range achieved with discomfort at end-range.',
      romDegrees: 155,
      painResponse: 'moderate',
    },
    {
      id: 'shoulder-rom-abduction',
      name: 'ROM: shoulder abduction',
      category: 'rom',
      region: 'shoulder',
      briefInstruction: 'Measure active shoulder abduction range with a goniometer.',
      relevantToHypotheses: ['subacromial impingement'],
      expectedResult: 'positive',
      resultDetail: 'Painful arc between roughly 80° and 120° during abduction.',
      romDegrees: 150,
      painResponse: 'moderate',
    },
    {
      id: 'shoulder-rom-external-rotation',
      name: 'ROM: shoulder external rotation',
      category: 'rom',
      region: 'shoulder',
      briefInstruction: 'Measure passive external rotation with the elbow tucked at the side.',
      relevantToHypotheses: ['adhesive capsulitis'],
      expectedResult: 'negative',
      resultDetail: 'Full, pain-free external rotation -- argues against adhesive capsulitis (frozen shoulder).',
      romDegrees: 80,
      painResponse: 'none',
    },
    {
      id: 'shoulder-palpation-subacromial',
      name: 'Palpation: subacromial region',
      category: 'palpation',
      region: 'shoulder',
      briefInstruction: 'Palpate the subacromial space just below the anterolateral acromion.',
      relevantToHypotheses: ['subacromial impingement', 'rotator cuff tendinopathy'],
      expectedResult: 'positive',
      resultDetail: 'Localized tenderness over the subacromial space.',
      romDegrees: null,
      painResponse: 'mild',
    },
    {
      id: 'shoulder-cervical-spurling',
      name: "Spurling's test (cervical spine)",
      category: 'special_test',
      region: 'shoulder',
      briefInstruction: 'Extend, laterally flex, and axially load the cervical spine toward the symptomatic side.',
      relevantToHypotheses: ['cervical radiculopathy'],
      expectedResult: 'negative',
      resultDetail: 'No reproduction of shoulder or arm symptoms -- a cervical spine source is unlikely here, so this test adds little for a straightforward shoulder presentation.',
      romDegrees: null,
      painResponse: 'none',
    },
  ],
  rubric: {
    subjectiveKeyQuestions: [
      'onset and mechanism',
      'aggravating factors (overhead activity)',
      'easing factors',
      'pain severity',
      'night pain',
      'weakness',
      'red-flag screening (trauma, systemic symptoms)',
    ],
    redFlagQuestions: ['systemic symptoms (fever, weight loss)', 'trauma history'],
    expectedHypotheses: ['subacromial impingement', 'rotator cuff tendinopathy', 'adhesive capsulitis'],
    discriminatingTestIds: [
      'shoulder-neer',
      'shoulder-hawkins',
      'shoulder-empty-can',
      'shoulder-drop-arm',
      'shoulder-rom-flexion',
      'shoulder-rom-external-rotation',
    ],
    irrelevantTestIds: ['shoulder-cervical-spurling'],
    correctDiagnosis: 'Subacromial impingement / rotator cuff tendinopathy',
  },
  status: 'approved',
};

const LUMBAR_DISC_LBP: IPhysioScenario = {
  id: 'physio-lumbar-disc-lbp',
  region: 'lumbar_spine',
  problemCode: 'LUMBAR_DISC_RADICULAR',
  personaName: 'Priya',
  personaSystemPrompt:
    'You are Priya, a 34-year-old office worker with sudden-onset low back pain that started after lifting ' +
    'a heavy box 5 days ago, now radiating down the back of the right leg to below the knee. Answer in plain ' +
    'language, describe symptoms honestly, and only mention bladder/bowel or saddle symptoms if directly asked.',
  presentingComplaint: 'Low back pain radiating down the right leg since lifting a heavy box 5 days ago.',
  openingLine:
    "Hi doctor. My lower back has been really painful since I lifted a heavy box at work about 5 days ago, " +
    "and now it's shooting down the back of my right leg, almost to my knee.",
  subjectiveScript: [
    {
      keywords: ['onset', 'start', 'begin', 'how long', 'when did'],
      reply: 'It started suddenly, right after I lifted a heavy box awkwardly at work about 5 days ago. Felt a sharp twinge in my low back straight away.',
    },
    {
      keywords: ['leg', 'radiat', 'travel', 'down the leg', 'below the knee'],
      reply: 'Yes, it shoots down the back of my right thigh and calf, down to about my knee, sometimes a bit further.',
    },
    {
      keywords: ['worse', 'aggravat', 'trigger'],
      reply: 'Sitting for long periods makes it much worse, and so does bending forward. Coughing or sneezing gives me a sharp jolt too.',
    },
    {
      keywords: ['better', 'eas', 'relie'],
      reply: 'Lying down flat helps a bit, and standing up and walking around actually eases it more than sitting does.',
    },
    {
      keywords: ['numbness', 'tingl', 'pins and needles'],
      reply: 'A bit of tingling down the back of my calf, yes. Not numb exactly, more like pins and needles.',
    },
    {
      keywords: ['weak', 'weakness', 'strength', 'foot drop'],
      reply: "I haven't noticed any real weakness, my leg still feels like it holds my weight fine.",
    },
    {
      keywords: ['bladder', 'bowel', 'saddle', 'incontinence', 'numbness around'],
      reply: "No, nothing like that -- I have normal control and no numbness around that area.",
    },
    {
      keywords: ['fever', 'unwell', 'weight loss', 'night sweats', 'systemic'],
      reply: 'No fevers or anything like that, I feel otherwise healthy.',
    },
    {
      keywords: ['injury', 'fall', 'trauma', 'accident', 'mechanism'],
      reply: "Just the lifting incident -- awkward posture, twisted a bit while picking up the box.",
    },
    {
      keywords: ['pain scale', 'how bad', 'rate', 'severity', 'out of 10'],
      reply: "The back pain is about a 5, but when it shoots down my leg it spikes to an 8.",
    },
    {
      keywords: ['job', 'work', 'occupation'],
      reply: 'I work at a desk most of the day, so I sit a lot -- which is exactly what makes it worse now.',
    },
  ],
  fallbackReply: "Sorry, could you ask that a bit differently? I'm not sure I follow.",
  testBank: [
    {
      id: 'lumbar-slr',
      name: 'Straight leg raise (SLR)',
      category: 'special_test',
      region: 'lumbar_spine',
      briefInstruction: 'Passively raise the straight leg with the patient supine until symptoms reproduce.',
      relevantToHypotheses: ['lumbar disc herniation with radiculopathy'],
      expectedResult: 'positive',
      resultDetail: 'Reproduces radiating leg pain at approximately 35° of hip flexion -- a positive result below 45° is suggestive of nerve root tension.',
      romDegrees: 35,
      painResponse: 'moderate',
    },
    {
      id: 'lumbar-slump',
      name: 'Slump test',
      category: 'special_test',
      region: 'lumbar_spine',
      briefInstruction: 'Seated slump with neck flexion, then knee extension and ankle dorsiflexion.',
      relevantToHypotheses: ['lumbar disc herniation with radiculopathy'],
      expectedResult: 'positive',
      resultDetail: 'Reproduces familiar leg symptoms, which ease slightly with cervical extension -- consistent with neural tension.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'lumbar-rom-flexion',
      name: 'ROM: lumbar flexion',
      category: 'rom',
      region: 'lumbar_spine',
      briefInstruction: 'Measure active lumbar flexion, noting symptom response.',
      relevantToHypotheses: ['lumbar disc herniation with radiculopathy'],
      expectedResult: 'positive',
      resultDetail: 'Markedly limited by pain, with symptoms peripheralizing down the leg toward end-range.',
      romDegrees: 30,
      painResponse: 'severe',
    },
    {
      id: 'lumbar-rom-extension',
      name: 'ROM: lumbar extension',
      category: 'rom',
      region: 'lumbar_spine',
      briefInstruction: 'Measure active lumbar extension, noting symptom response.',
      relevantToHypotheses: ['lumbar disc herniation with radiculopathy'],
      expectedResult: 'negative',
      resultDetail: 'Extension centralizes symptoms -- leg pain retreats back toward the spine, a favorable directional-preference finding.',
      romDegrees: 20,
      painResponse: 'mild',
    },
    {
      id: 'lumbar-palpation-paraspinal',
      name: 'Palpation: lumbar paraspinals',
      category: 'palpation',
      region: 'lumbar_spine',
      briefInstruction: 'Palpate the paraspinal musculature at L4-S1.',
      relevantToHypotheses: ['lumbar disc herniation with radiculopathy'],
      expectedResult: 'positive',
      resultDetail: 'Palpable guarding and tenderness in the right lower lumbar paraspinals.',
      romDegrees: null,
      painResponse: 'mild',
    },
    {
      id: 'lumbar-hip-scour',
      name: 'Hip scour test',
      category: 'special_test',
      region: 'lumbar_spine',
      briefInstruction: 'Passively flex, adduct, and internally rotate the hip while applying axial load.',
      relevantToHypotheses: ['hip joint pathology'],
      expectedResult: 'negative',
      resultDetail: 'No reproduction of symptoms -- a hip joint source is unlikely, so this test adds little given the clear lumbar/radicular pattern.',
      romDegrees: null,
      painResponse: 'none',
    },
  ],
  rubric: {
    subjectiveKeyQuestions: [
      'onset and mechanism (lifting)',
      'leg symptom distribution',
      'aggravating factors (sitting, flexion, coughing)',
      'easing factors (walking, extension)',
      'pins and needles / numbness',
      'weakness',
      'red-flag screening (bladder/bowel, saddle anesthesia)',
    ],
    redFlagQuestions: ['bladder or bowel changes', 'saddle anesthesia', 'progressive neurological deficit'],
    expectedHypotheses: ['lumbar disc herniation with radiculopathy', 'lumbar radiculopathy', 'sciatica'],
    discriminatingTestIds: [
      'lumbar-slr',
      'lumbar-slump',
      'lumbar-rom-flexion',
      'lumbar-rom-extension',
      'lumbar-palpation-paraspinal',
    ],
    irrelevantTestIds: ['lumbar-hip-scour'],
    correctDiagnosis: 'Lumbar disc herniation with L5/S1 radiculopathy',
  },
  status: 'approved',
};

const ANKLE_SPRAIN: IPhysioScenario = {
  id: 'physio-ankle-lateral-sprain',
  region: 'ankle_foot',
  problemCode: 'ANKLE_LATERAL_SPRAIN',
  personaName: 'Jordan',
  personaSystemPrompt:
    'You are Jordan, a 22-year-old recreational basketball player who rolled their right ankle inward during ' +
    'a game 2 days ago. Answer subjective questions in plain, athletic-but-non-clinical language.',
  presentingComplaint: 'Right ankle pain and swelling after rolling it during basketball 2 days ago.',
  openingLine:
    "Hey, so I rolled my right ankle pretty bad during a basketball game two days ago. It's swollen and " +
    "still pretty sore, especially on the outside.",
  subjectiveScript: [
    {
      keywords: ['onset', 'start', 'begin', 'how long', 'when did', 'mechanism', 'happen'],
      reply: 'It happened two days ago -- I landed on someone\'s foot after a jump and my ankle rolled inward, sole facing in.',
    },
    {
      keywords: ['worse', 'aggravat', 'trigger', 'weight bear', 'walk'],
      reply: 'Putting weight on it or trying to push off is the worst. Walking on uneven ground is really uncomfortable too.',
    },
    {
      keywords: ['better', 'eas', 'relie', 'rest', 'ice'],
      reply: "Ice and keeping it elevated helps with the swelling. Resting it definitely eases the pain.",
    },
    {
      keywords: ['swell', 'bruis'],
      reply: "Yeah, it swelled up pretty quickly, mostly on the outside of the ankle, and there's some bruising now too.",
    },
    {
      keywords: ['pop', 'snap', 'crack', 'hear'],
      reply: "I don't remember hearing a pop, just felt it give way and a sharp pain right away.",
    },
    {
      keywords: ['weight bear', 'walk on it', 'able to walk', 'four steps'],
      reply: 'I could hobble a few steps right after it happened, and I can walk short distances now, but it\'s stiff and sore.',
    },
    {
      keywords: ['numbness', 'tingl', 'pins and needles'],
      reply: 'No numbness or tingling, just the swelling and soreness on the outside.',
    },
    {
      keywords: ['bone tender', 'point tender', 'malleolus', 'ankle bone'],
      reply: "It's tender over the bump on the outside of my ankle, and a bit along the outer edge of my foot too.",
    },
    {
      keywords: ['fever', 'unwell', 'systemic'],
      reply: "No, I feel fine otherwise, just the ankle.",
    },
    {
      keywords: ['previous', 'before', 'history', 'sprain before'],
      reply: "I've rolled this same ankle once before a couple of years ago, but it wasn't this bad.",
    },
  ],
  fallbackReply: 'Not sure I understand -- can you rephrase that?',
  testBank: [
    {
      id: 'ankle-anterior-drawer',
      name: 'Anterior drawer test',
      category: 'special_test',
      region: 'ankle_foot',
      briefInstruction: 'Stabilize the tibia, draw the calcaneus/talus forward.',
      relevantToHypotheses: ['lateral ankle ligament sprain (ATFL)'],
      expectedResult: 'positive',
      resultDetail: 'Increased anterior translation compared to the uninvolved side, consistent with ATFL laxity.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'ankle-talar-tilt',
      name: 'Talar tilt test',
      category: 'special_test',
      region: 'ankle_foot',
      briefInstruction: 'Stabilize the tibia and invert the calcaneus to stress the calcaneofibular ligament.',
      relevantToHypotheses: ['lateral ankle ligament sprain (CFL involvement)'],
      expectedResult: 'positive',
      resultDetail: 'Mild increased inversion with pain, suggesting CFL involvement alongside the ATFL.',
      romDegrees: null,
      painResponse: 'moderate',
    },
    {
      id: 'ankle-rom-dorsiflexion',
      name: 'ROM: ankle dorsiflexion',
      category: 'rom',
      region: 'ankle_foot',
      briefInstruction: 'Measure active dorsiflexion range, knee extended.',
      relevantToHypotheses: ['lateral ankle ligament sprain'],
      expectedResult: 'positive',
      resultDetail: 'Limited to roughly 5° due to swelling and pain, compared to an expected ~20°.',
      romDegrees: 5,
      painResponse: 'moderate',
    },
    {
      id: 'ankle-palpation-lateral-malleolus',
      name: 'Palpation: lateral malleolus / ATFL',
      category: 'palpation',
      region: 'ankle_foot',
      briefInstruction: 'Palpate the lateral malleolus and the course of the ATFL anteriorly.',
      relevantToHypotheses: ['lateral ankle ligament sprain'],
      expectedResult: 'positive',
      resultDetail: 'Point tenderness over the ATFL, no bony tenderness directly over the malleolus tip.',
      romDegrees: null,
      painResponse: 'mild',
    },
    {
      id: 'ankle-squeeze-test',
      name: 'Squeeze test (syndesmosis)',
      category: 'special_test',
      region: 'ankle_foot',
      briefInstruction: 'Squeeze the tibia and fibula together at mid-calf.',
      relevantToHypotheses: ['syndesmosis (high ankle) sprain'],
      expectedResult: 'negative',
      resultDetail: 'No pain reproduced at the distal syndesmosis -- a high ankle sprain is unlikely here.',
      romDegrees: null,
      painResponse: 'none',
    },
  ],
  rubric: {
    subjectiveKeyQuestions: [
      'mechanism of injury (inversion)',
      'ability to weight-bear immediately after',
      'swelling and bruising onset',
      'aggravating and easing factors',
      'point of maximal tenderness',
      'previous ankle sprain history',
    ],
    redFlagQuestions: ['inability to weight-bear (Ottawa ankle rule)', 'bony point tenderness at malleoli'],
    expectedHypotheses: ['lateral ankle ligament sprain', 'ATFL sprain'],
    discriminatingTestIds: [
      'ankle-anterior-drawer',
      'ankle-talar-tilt',
      'ankle-rom-dorsiflexion',
      'ankle-palpation-lateral-malleolus',
    ],
    irrelevantTestIds: ['ankle-squeeze-test'],
    correctDiagnosis: 'Grade II lateral ankle ligament sprain',
  },
  status: 'approved',
};

export const MOCK_PHYSIO_SCENARIOS: IPhysioScenario[] = [SHOULDER_IMPINGEMENT, LUMBAR_DISC_LBP, ANKLE_SPRAIN];

export function getPhysioScenariosByRegion(region: string): IPhysioScenario[] {
  return MOCK_PHYSIO_SCENARIOS.filter((scenario) => scenario.region === region);
}

export function getPhysioScenarioById(scenarioId: string): IPhysioScenario | undefined {
  return MOCK_PHYSIO_SCENARIOS.find((scenario) => scenario.id === scenarioId);
}
