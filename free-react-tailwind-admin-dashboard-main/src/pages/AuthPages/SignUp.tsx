import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="TUCASA UDOM ZONE | SIGN UP"
        description="TO THIS PAGE YOU ARE WELCOME TO JOIN THE TUCASA UDOM ZONE PLATFORM, JUST FILL THE FORM BELOW TO CREATE AN ACCOUNT, THEN NAVIGATE TO THE G-MAIL INBOX AND COPY  USERNAME THEN VERIFY AN ACCOUNT, READY TO LOGIN"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
