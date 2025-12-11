import { Input } from "@/core/components/uiLibrary/input";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Label } from "@/core/components/uiLibrary/label";
import AccountSettingsHeader from "./components/AccountSettingsHeader";
import AccountSettingsSection from "./components/AccountSettingsSection";

export default function AccountSettings() {
  const email = "temp@email.com";
  const trialDaysLeft = 14;
  const handleInputChange = () => {
    console.log("handle name input change");
  };

  const name = {
    value: "lewis",
    onChange: handleInputChange,
  };

  const handleLogout = () => {
    console.log("log out");
  };
  const onLogout = handleLogout;

  return (
    <div>
      <AccountSettingsHeader />
      <div className="flex justify-center">
        <div className="w-[650px] px-2 space-y-2">
          <AccountSettingsSection
            title="Account Settings"
            titleClassName="text-4xl"
          >
            <div className="flex gap-4">
              <p>{email}</p>
              <button onClick={onLogout} className="text-sky-700">
                log out
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-[500]">First name</p>
                <p>
                  We use your first name to personalise your Budgie experience.
                </p>
              </div>
              <div className="flex justify-between items-center">
                <Input
                  value={name.value}
                  onChange={name.onChange}
                  className="w-[300px] border border-gray-400 focus-visible:ring-sky-700"
                />
                <button className="px-4 py-2 bg-sky-700 text-white rounded">
                  Save
                </button>
              </div>
            </div>
          </AccountSettingsSection>

          <AccountSettingsSection title="Login Methods">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-[500]">Email & Password</p>
                <p>{email}</p>
              </div>
              <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded">
                Change Email & Password
              </button>
            </div>
          </AccountSettingsSection>

          <AccountSettingsSection title="Trial">
            <div className="flex justify-between items-center">
              <div>
                <p>
                  You have{" "}
                  <span className="font-[500]">{trialDaysLeft} days</span> left
                  on your trial
                </p>
              </div>
              <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded">
                Subscribe now
              </button>
            </div>
          </AccountSettingsSection>

          <AccountSettingsSection title="Options">
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                className="[&_svg]:h-3 [&_svg]:w-3 data-[state=checked]:border-orange-600 data-[state=checked]:bg-orange-600 data-[state=checked]:text-white"
              />
              <label htmlFor="terms">Enable keyboard shortcuts</label>
            </div>
          </AccountSettingsSection>

          <AccountSettingsSection title="Delete Account">
            <div className="flex justify-between items-center">
              <div className="w-[400px]">
                <p>
                  Delete your account if you no longer wish to use Budgie (and
                  want all of your account and plan data permanently deleted).
                </p>
              </div>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded">
                Delete Account
              </button>
            </div>
          </AccountSettingsSection>
        </div>
      </div>
    </div>
  );
}
