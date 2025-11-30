import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { apiService, FullUser, UpdateProfileRequest } from "../../services/api";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // User fields
    first_name: "",
    last_name: "",
    email: "",
    
    // Profile fields
    bio: "",
    phone: "",
    location: "",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    instagram_url: "",
    country: "",
    city_state: "",
    postal_code: "",
    tax_id: "",
  });

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      setError("Please log in to view your profile");
      setLoading(false);
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.getUserProfile();
      setUser(userData);
      
      // Initialize form data with current data
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        bio: userData.profile.bio || "",
        phone: userData.profile.phone || "",
        location: userData.profile.location || "",
        facebook_url: userData.profile.facebook_url || "",
        twitter_url: userData.profile.twitter_url || "",
        linkedin_url: userData.profile.linkedin_url || "",
        instagram_url: userData.profile.instagram_url || "",
        country: userData.profile.country || "",
        city_state: userData.profile.city_state || "",
        postal_code: userData.profile.postal_code || "",
        tax_id: userData.profile.tax_id || "",
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
      
      if (error.status === 401) {
        apiService.clearAuth();
        window.location.href = '/signin';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!apiService.isAuthenticated()) {
        setError("Please log in to update your profile");
        return;
      }

      // Prepare update data
      const updateData: UpdateProfileRequest = { ...formData };

      console.log('Updating profile with data:', updateData);

      const updatedUser = await apiService.updateUserProfile(updateData);
      setUser(updatedUser);
      
      closeModal();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(
        error.message || 
        error.details?.message || 
        'Failed to update profile. Please check your data and try again.'
      );
      
      if (error.status === 401) {
        apiService.clearAuth();
        window.location.href = '/signin';
      }
    } finally {
      setSaving(false);
    }
  };

  const getDisplayValue = (value: string | null | undefined, fallback: string = "Not provided") => {
    return value && value.trim() !== "" ? value : fallback;
  };

  const getFullName = () => {
    if (user) {
      const fullName = `${user.first_name} ${user.last_name}`.trim();
      return fullName || user.username;
    }
    return "User";
  };

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const profile = user?.profile;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(user?.first_name)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(user?.last_name)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(user?.email)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.phone)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.bio)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Location
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.location)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.country)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                City/State
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.city_state)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Postal Code
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.postal_code)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tax ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDisplayValue(profile?.tax_id)}
              </p>
            </div>
          </div>

          {/* Social Links Display */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h5 className="mb-4 text-md font-medium text-gray-800 dark:text-white/90">
              Social Links
            </h5>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {profile?.facebook_url && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Facebook
                  </p>
                  <a 
                    href={profile.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {profile.facebook_url}
                  </a>
                </div>
              )}

              {profile?.twitter_url && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Twitter
                  </p>
                  <a 
                    href={profile.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {profile.twitter_url}
                  </a>
                </div>
              )}

              {profile?.linkedin_url && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    LinkedIn
                  </p>
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {profile.linkedin_url}
                  </a>
                </div>
              )}

              {profile?.instagram_url && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Instagram
                  </p>
                  <a 
                    href={profile.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {profile.instagram_url}
                  </a>
                </div>
              )}

              {!profile?.facebook_url && !profile?.twitter_url && !profile?.linkedin_url && !profile?.instagram_url && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No social links provided
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          {error && (
            <div className="px-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {/* Social Links Section */}
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input
                      id="facebook"
                      type="text"
                      value={formData.facebook_url}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                      placeholder="https://www.facebook.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input 
                      id="twitter"
                      type="text" 
                      value={formData.twitter_url}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                      placeholder="https://x.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      type="text"
                      value={formData.linkedin_url}
                      onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input 
                      id="instagram"
                      type="text" 
                      value={formData.instagram_url}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input 
                      id="first-name"
                      type="text" 
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Your first name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input 
                      id="last-name"
                      type="text" 
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Your last name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio"
                      type="text" 
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      type="text" 
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Your general location"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country"
                      type="text" 
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Your country"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="city-state">City/State</Label>
                    <Input 
                      id="city-state"
                      type="text" 
                      value={formData.city_state}
                      onChange={(e) => handleInputChange('city_state', e.target.value)}
                      placeholder="Your city and state"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input 
                      id="postal-code"
                      type="text" 
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Your postal code"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="tax-id">Tax ID</Label>
                    <Input 
                      id="tax-id"
                      type="text" 
                      value={formData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      placeholder="Your tax identification number"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal} 
                disabled={saving}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={saving}
                type="button"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}