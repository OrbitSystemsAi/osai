export function enrollmentOptionsBody(label: string) {
  return { label: label.trim() }
}

export function enrollmentVerificationBody(registrationTransaction: string, credential: object) {
  return { registration_transaction: registrationTransaction, credential }
}
