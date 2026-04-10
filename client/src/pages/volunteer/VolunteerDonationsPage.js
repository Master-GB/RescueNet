import React, { useEffect, useState } from "react";
import { 
  Heart, 
  Search, 
  Target, 
  TrendingUp, 
  Calendar, 
  Building2, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  X,
  Upload,
  CheckCircle2,
  DollarSign,
  Package
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";
import { listMyCampaigns } from "../../services/campaignService"; // We will use the active campaigns logic
import { submitDonation } from "../../services/donationService";
import apiClient from "../../services/apiClient";

const VolunteerDonationsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Donation Modal State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationError, setDonationError] = useState("");
  const [formData, setFormData] = useState({
    donationType: "Money",
    declaredAmount: "",
    donorMessage: "",
    proofImage: null
  });

  const fetchActiveCampaigns = async () => {
    setLoading(true);
    try {
      // Using the public active campaigns endpoint
      const response = await apiClient.get("/api/campaigns/active");
      setCampaigns(response.data.campaigns || []);
    } catch (err) {
      setError("Failed to load active campaigns. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

  const handleOpenDonateModal = (campaign) => {
    setSelectedCampaign(campaign);
    setDonationSuccess(false);
    setDonationError("");
    setFormData({
      donationType: "Money",
      declaredAmount: "",
      donorMessage: "",
      proofImage: null
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, proofImage: e.target.files[0] }));
    }
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!formData.proofImage) {
      setDonationError("Please upload a proof of payment screenshot.");
      return;
    }

    setIsSubmitting(true);
    setDonationError("");

    try {
      await submitDonation({
        campaignId: selectedCampaign._id,
        ...formData
      });
      setDonationSuccess(true);
      // Refresh campaigns to show updated progress (might need some delay for backend)
      setTimeout(() => {
         fetchActiveCampaigns();
      }, 2000);
    } catch (err) {
      setDonationError(err.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
              </div>
              Relief Campaigns
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Support critical NGO missions with your contributions
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-slate-900 focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading active campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-xl">{error}</p>
            <button 
              onClick={fetchActiveCampaigns}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 p-20 rounded-3xl text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No campaigns found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => {
              const progress = Math.min(Math.round((campaign.raisedAmount / campaign.targetAmount) * 100), 100);
              
              return (
                <div 
                  key={campaign._id}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Campaign Image Placeholder */}
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                    {campaign.campaignImageUrl ? (
                      <img 
                        src={campaign.campaignImageUrl.startsWith('http') ? campaign.campaignImageUrl : `/${campaign.campaignImageUrl}`} 
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
                            <Heart className="w-12 h-12 text-blue-200" />
                        </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 shadow-sm">
                        {campaign.status}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{campaign.title}</h3>
                    </div>
                    
                    <p className="text-slate-600 text-sm line-clamp-2 mb-6 h-10">
                      {campaign.description}
                    </p>

                    <div className="space-y-4 mt-auto">
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-500 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Raised: LKR {campaign.raisedAmount.toLocaleString()}
                            </span>
                            <span className="text-blue-600">{progress}%</span>
                        </div>
                        
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Target: LKR {campaign.targetAmount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {campaign.ngoId?.name || "NGO"}
                            </span>
                        </div>

                        <button 
                          onClick={() => handleOpenDonateModal(campaign)}
                          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                        >
                          Donate Now
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Donation Modal */}
        {selectedCampaign && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setSelectedCampaign(null)}
                        className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition z-10"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>

                    <div className="p-8">
                        {!donationSuccess ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Make a Donation</h2>
                                    <p className="text-slate-500 mt-1">Supporting: <span className="font-bold text-emerald-600">{selectedCampaign.title}</span></p>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Bank Details
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 text-sm text-blue-900">
                                        <p><span className="opacity-60">Bank:</span> {selectedCampaign.bankDetails?.bankName}</p>
                                        <p><span className="opacity-60">Account:</span> {selectedCampaign.bankDetails?.accountNumber}</p>
                                        <p><span className="opacity-60">Name:</span> {selectedCampaign.bankDetails?.accountName}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitDonation} className="space-y-6">
                                    <div className="flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, donationType: 'Money' }))}
                                            className={`flex-1 py-3 rounded-2xl border-2 font-bold transition flex items-center justify-center gap-2 ${
                                                formData.donationType === 'Money' 
                                                ? 'bg-blue-600 border-blue-600 text-white' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                            }`}
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            Money
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, donationType: 'Supplies' }))}
                                            className={`flex-1 py-3 rounded-2xl border-2 font-bold transition flex items-center justify-center gap-2 ${
                                                formData.donationType === 'Supplies' 
                                                ? 'bg-blue-600 border-blue-600 text-white' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                            }`}
                                        >
                                            <Package className="w-4 h-4" />
                                            Supplies
                                        </button>
                                    </div>

                                    {formData.donationType === 'Money' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Declared Amount (LKR)</label>
                                            <input 
                                                type="number"
                                                required
                                                value={formData.declaredAmount}
                                                onChange={(e) => setFormData(p => ({ ...p, declaredAmount: e.target.value }))}
                                                placeholder="Amount you've transferred"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Proof of Payment</label>
                                        <div className="relative group">
                                            <input 
                                                type="file"
                                                required
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            />
                                            <div className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition ${
                                                formData.proofImage 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-slate-200 bg-slate-50 group-hover:border-blue-300 group-hover:bg-blue-50'
                                            }`}>
                                                {formData.proofImage ? (
                                                    <div className="flex flex-col items-center text-emerald-700">
                                                        <CheckCircle2 className="w-8 h-8 mb-2" />
                                                        <span className="text-sm font-bold max-w-[200px] truncate">{formData.proofImage.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        <Upload className="w-8 h-8 mb-2 transition-transform group-hover:-translate-y-1" />
                                                        <span className="text-sm font-bold">Click or drag receipt image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {donationError && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                            <p className="text-sm text-red-700 font-medium">{donationError}</p>
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 disabled:bg-emerald-400 disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : "Confirm Donation"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-up-center">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Thank You!</h2>
                                <p className="text-slate-500 text-lg mb-8 px-8">
                                    Your donation has been submitted. The NGO will verify your contribution shortly.
                                </p>
                                <button 
                                    onClick={() => setSelectedCampaign(null)}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
      
      <style>{`
        .scale-up-center {
            animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
        }
        @keyframes scale-up-center {
            0% { transform: scale(0.5); }
            100% { transform: scale(1); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default VolunteerDonationsPage;
