// src/components/CryptoChart.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; // إضافة waitFor إلى الواردات
import { act } from 'react'; // استيراد act من react
import CryptoChart from './components/CryptoChart';
import axios from 'axios';

jest.mock('axios');

describe('CryptoChart Component', () => {
  const mockFetchData = [
    [1629302400000, '47000', '47500', '46500', '47200'], // Example data format from Binance API
    [1629306000000, '47200', '47800', '46800', '47400'],
  ];

  const fromCurrency = 'BTC';
  const toCurrency = 'USDT';
  const timeFrame = '1D';
  const onTimeFrameChange = jest.fn();

  beforeEach(() => {
    // إعادة تعيين جميع المحاكاة قبل كل اختبار
    jest.clearAllMocks();
  });

  it('changes timeframe when timeframe buttons are clicked', async () => {
    // محاكاة استجابة API
    axios.get.mockResolvedValue({ data: mockFetchData });

    // تغليف render داخل act لضمان معالجة التحديثات
    await act(async () => {
      render(
        <CryptoChart
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          timeFrame={timeFrame}
          onTimeFrameChange={onTimeFrameChange}
        />
      );
    });

    // الانتظار حتى يتم تحميل البيانات واختفاء رسالة التحميل
    await waitFor(() => expect(screen.queryByText(/Loading chart data.../i)).not.toBeInTheDocument());

    // البحث عن زر "1H" بعد التأكد من تحميل البيانات
    const button = screen.getByText('1H');

    // تغليف التفاعل داخل act
    await act(async () => {
      fireEvent.click(button);
    });

    // التأكد من استدعاء الدالة مع الإطار الزمني الصحيح
    expect(onTimeFrameChange).toHaveBeenCalledWith('1H');
  });
});
