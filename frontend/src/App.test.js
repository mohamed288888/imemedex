import { jest } from '@jest/globals';


// محاكاة مكتبة @solana/wallet-adapter-react
jest.mock('@solana/wallet-adapter-react', () => {
  // إعداد المحاكاة داخل jest.mock مباشرة لضمان أن المحاكاة محكمة
  return {
    __esModule: true,
    useWallet: () => ({
      connected: true, // تعيين المحفظة كمتصلة
      connect: () => {}, // وظيفة المحاكاة للاتصال
      disconnect: () => {}, // وظيفة المحاكاة لقطع الاتصال
      publicKey: {
        toBase58: () => 'mockedPublicKey' // محاكاة المفتاح العام ككائن مع وظيفة toBase58
      },
    }),
  };
});

describe('useWallet hook', () => {
  it('should return a connected wallet', () => {
    // استيراد useWallet من المحاكاة
    const { useWallet } = require('@solana/wallet-adapter-react');
    
    // التأكد من تعريف المحاكاة
    expect(useWallet).toBeDefined();

    // استدعاء الوظيفة المحاكية للتحقق من القيم
    const wallet = useWallet();

    // التأكد من أن الكائن wallet ليس undefined
    expect(wallet).toBeDefined();
    expect(wallet.connected).toBe(true);
    expect(wallet.publicKey.toBase58()).toBe('mockedPublicKey');
  });
});