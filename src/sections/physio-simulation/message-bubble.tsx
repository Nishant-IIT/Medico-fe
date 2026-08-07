// IPhysioMessage is field-for-field identical to IMessage (id, attemptId,
// role: 'student'|'patient', content, createdAt), so the generic module's
// bubble is reusable unchanged -- this file just re-exports it so the
// physio section stays self-contained and doesn't reach into
// `sections/simulation` from every call site.
export { default } from 'src/sections/simulation/message-bubble';
