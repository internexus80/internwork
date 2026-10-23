export function certificateVerificationUrl(certificateId: string, siteOrigin: string): string {
  return new URL(`/verify/${encodeURIComponent(certificateId)}`, siteOrigin).toString();
}
