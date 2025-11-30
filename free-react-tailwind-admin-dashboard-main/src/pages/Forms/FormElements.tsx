import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import InputGroup from "../../components/form/form-elements/InputGroup";

import PageMeta from "../../components/common/PageMeta";

export default function FormElements() {
  return (
    <div>
      <PageMeta
        title="TUCASA UDOM ZONE / TIMETABLE"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1 gap-8 ">
        <div className="">
        
          <InputGroup />
        </div>
  
      </div>
    </div>
  );
}
