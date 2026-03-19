import { revalidatePath } from 'next/cache';

export function revalidateCouponPaths(couponIds: string[] = []) {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/kuponlar');
  revalidatePath('/gecmis-kuponlar');
  revalidatePath('/aylik-istatistik');

  for (const couponId of couponIds) {
    revalidatePath(`/admin/kupon/${couponId}`);
  }
}
