import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
} from '@/components/common';
import { CheckboxWithLabel } from '@/components/common/Checkbox';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-600">
          Manage your account preferences
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckboxWithLabel
            id="email-notifications"
            label="Email Notifications"
            description="Receive updates about your applications via email"
            defaultChecked
          />
          <CheckboxWithLabel
            id="sms-notifications"
            label="SMS Notifications"
            description="Receive urgent updates via SMS"
          />
          <CheckboxWithLabel
            id="marketing"
            label="Marketing Communications"
            description="Receive news and promotional content"
          />
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Password</p>
              <p className="text-sm text-neutral-500">
                Last changed 30 days ago
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-neutral-500">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-error-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Delete Account</p>
              <p className="text-sm text-neutral-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
