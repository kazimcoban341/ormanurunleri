import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertCircle, Info, RefreshCcw } from 'lucide-react';

const App = () => {
  const [inputs, setInputs] = useState({
    ihaleBirimFiyat: 3.8,
    tonaj: 1889,
    ormanOdemeOran: 0.02,
    yolAcmaToplam: 30,
    kesmeBirim: 0.7,
    yuklemeBirim: 0.25,
    odunNakliyeBirim: 0.75,
    tomrukNakliyeBirim: 0.75,
    digerGiderOran: 3,
    odunOran: 0.48,
    odunSatisBirim: 3.6
  });

  const [results, setResults] = useState<{
    ihaleTutar: number;
    ormanOdemesi: number;
    toplamMaliyet: number;
    odunTonaj: number;
    tomrukTonaj: number;
    odunCiro: number;
    tomrukBirimFiyat: number;
    kesmeMaliyet: number;
    yuklemeMaliyet: number;
    nakliyeToplam: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const calculate = () => {
    try {
      setError("");
      const {
        ihaleBirimFiyat, tonaj, ormanOdemeOran, yolAcmaToplam,
        kesmeBirim, yuklemeBirim, odunNakliyeBirim, tomrukNakliyeBirim,
        digerGiderOran, odunOran, odunSatisBirim
      } = inputs;

      if (tonaj <= 0) throw new Error("Tahmini tonaj 0'dan büyük olmalıdır.");
      if (odunOran > 1) throw new Error("Odun oranı 1.00'den büyük olamaz.");

      // 1. İhale ve Temel Giderler
      const ihaleTutar = tonaj * ihaleBirimFiyat;
      const ormanOdemesi = ihaleTutar * ormanOdemeOran;
      const toplamIhale = ihaleTutar + ormanOdemesi;

      // 2. Operasyonel Giderler
      const kesmeMaliyet = tonaj * kesmeBirim;
      const yuklemeMaliyet = tonaj * yuklemeBirim;
      
      const odunTonaj = tonaj * odunOran;
      const tomrukTonaj = tonaj * (1 - odunOran);

      const odunNakliyeMaliyet = odunTonaj * odunNakliyeBirim;
      const tomrukNakliyeMaliyet = tomrukTonaj * tomrukNakliyeBirim;

      // 3. Toplam Maliyet (Kümülatif Diğer Gider Çarpanı ile)
      const araToplam = toplamIhale + yolAcmaToplam + kesmeMaliyet + yuklemeMaliyet + odunNakliyeMaliyet + tomrukNakliyeMaliyet;
      const toplamMaliyet = araToplam * (1 + (digerGiderOran / 100));

      // 4. Final: Tomruk Satış Birim Fiyatı
      const odunCiro = odunTonaj * odunSatisBirim;
      const tomrukBirimFiyat = (toplamMaliyet - odunCiro) / tomrukTonaj;

      setResults({
        ihaleTutar,
        ormanOdemesi,
        toplamMaliyet,
        odunTonaj,
        tomrukTonaj,
        odunCiro,
        tomrukBirimFiyat,
        kesmeMaliyet,
        yuklemeMaliyet,
        nakliyeToplam: odunNakliyeMaliyet + tomrukNakliyeMaliyet
      });
    } catch (err: any) {
      setError(err.message);
      setResults(null);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Orman Ürünleri Maliyet Analizi</h1>
          <p className="text-slate-500 text-sm">Stratejik Karar Destek Simülasyonu</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Giriş Paneli */}
          <div className="space-y-4">
            {/* Pembe Panel: İhale */}
            <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-rose-700 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> İhale Verileri
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <InputGroup label="İhale Birim Fiyatı" name="ihaleBirimFiyat" value={inputs.ihaleBirimFiyat} onChange={handleInputChange} color="rose" />
              </div>
            </div>

            {/* Sarı Panel: Değişkenler */}
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-amber-700 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info size={16} /> Operasyonel Değişkenler
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Tahmini Tonaj" name="tonaj" value={inputs.tonaj} onChange={handleInputChange} color="amber" />
                <InputGroup label="Orman Ödeme %" name="ormanOdemeOran" value={inputs.ormanOdemeOran} onChange={handleInputChange} color="amber" step="0.01" />
                <InputGroup label="Yol Açma" name="yolAcmaToplam" value={inputs.yolAcmaToplam} onChange={handleInputChange} color="amber" />
                <InputGroup label="Kesme (Birim)" name="kesmeBirim" value={inputs.kesmeBirim} onChange={handleInputChange} color="amber" />
                <InputGroup label="Yükleme (Birim)" name="yuklemeBirim" value={inputs.yuklemeBirim} onChange={handleInputChange} color="amber" />
                <InputGroup label="Odun Nakliye (Birim)" name="odunNakliyeBirim" value={inputs.odunNakliyeBirim} onChange={handleInputChange} color="amber" />
                <InputGroup label="Tomruk Nakliye (Birim)" name="tomrukNakliyeBirim" value={inputs.tomrukNakliyeBirim} onChange={handleInputChange} color="amber" />
                <InputGroup label="Diğer Gider %" name="digerGiderOran" value={inputs.digerGiderOran} onChange={handleInputChange} color="amber" />
                <InputGroup label="Odun Oranı" name="odunOran" value={inputs.odunOran} onChange={handleInputChange} color="amber" step="0.01" />
                <InputGroup label="Odun Satış Birim" name="odunSatisBirim" value={inputs.odunSatisBirim} onChange={handleInputChange} color="amber" />
              </div>
            </div>

            <button 
              onClick={calculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Calculator size={20} /> HESAPLA
            </button>
          </div>

          {/* Sonuç Paneli */}
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className={`bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-xl transition-all duration-500 ${results ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
              <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Analiz Sonuç Raporu</h3>
              
              {results ? (
                <div className="space-y-6">
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <p className="text-green-600 text-xs font-bold uppercase mb-1">Hedef Tomruk Satış Birim Fiyatı</p>
                    <p className="text-4xl font-black text-green-700">{formatCurrency(results.tomrukBirimFiyat)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <StatBox label="Toplam Maliyet" value={formatCurrency(results.toplamMaliyet)} />
                    <StatBox label="Odun Cirosu" value={formatCurrency(results.odunCiro)} />
                    <StatBox label="Kesme & Yükleme" value={formatCurrency(results.kesmeMaliyet + results.yuklemeMaliyet)} />
                    <StatBox label="Toplam Nakliye" value={formatCurrency(results.nakliyeToplam)} />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-[10px] font-bold uppercase">Odun Tonajı</p>
                      <p className="font-bold text-slate-700">{results.odunTonaj.toFixed(2)} t</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-[10px] font-bold uppercase">Tomruk Tonajı</p>
                      <p className="font-bold text-slate-700">{results.tomrukTonaj.toFixed(2)} t</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center text-slate-300 italic text-center">
                  <RefreshCcw size={48} className="mb-4 opacity-20" />
                  <p>Hesaplamak için verileri girin.</p>
                </div>
              )}
            </div>

            <div className="p-4 text-[11px] text-slate-400 leading-relaxed italic">
              * Bu araç bir finansal modelleme simülasyonudur. Sahadaki fire oranları ve lojistik değişkenler sonucu etkileyebilir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: 'rose' | 'amber';
  step?: string;
}

const InputGroup = ({ label, name, value, onChange, color, step = "0.1" }: InputGroupProps) => {
  const bgColor = color === 'rose' ? 'bg-rose-100 focus:ring-rose-400' : 'bg-amber-100 focus:ring-amber-400';
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
      <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange}
        step={step}
        className={`w-full ${bgColor} border-none rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:ring-2 outline-none transition-all`}
      />
    </div>
  );
};

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
    <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default App;
