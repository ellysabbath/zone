import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="TUCASA UDOM ZONE | SIGN IN"
        description="here you should enter username and password, the username is the one taken from the email( auto generated username)"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
