import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { Form, Button, Steps } from 'antd';
import NiceForm from '@ebay/nice-form-react';

export default function Wizard({
  // form,
  noReview = false,
  pending = false,
  pendingText = 'Submitting...',
  submitText = 'Submit',
  reviewText = 'Review',
  direction = 'horizontal',
  error = null,
  meta = null,
  getMeta = null,
  onCancel = () => {},
  onSubmit = () => {},
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const handleNext = () => {
    // Only validate fields in the current step
    let handleStepChange;
    if (wizardMeta.onStepChange) {
      handleStepChange = wizardMeta.onStepChange({ currentStep, nextStep: currentStep + 1, form });
    }
    const doNext = () => {
      const stepMeta = wizardMeta.steps.filter(s => !s.onlyReview)[currentStep];
      const fieldsToValidate = _.has(stepMeta, 'fieldsToValidate')
        ? _.get(stepMeta, 'fieldsToValidate', [])
        : _.get(stepMeta, 'formMeta.fields', []).map(f => f.key);
      form.validateFields(fieldsToValidate).then(() => {
        setCurrentStep(currentStep + 1);
      });
    };
    if (handleStepChange && handleStepChange.then) {
      handleStepChange.then(doNext);
    } else {
      doNext();
    }
  };

  const handleBack = () => {
    let handleStepChange;
    if (wizardMeta.onStepChange) {
      handleStepChange = wizardMeta.onStepChange({ currentStep, nextStep: currentStep - 1, form });
    }
    const doBack = () => setCurrentStep(currentStep - 1);
    if (handleStepChange && handleStepChange.then) {
      handleStepChange.then(doBack);
    } else {
      doBack();
    }
  };

  let wizardMeta = (getMeta && getMeta(form, { handleNext, handleBack, setCurrentStep })) ||
    meta || {
      steps: [],
    };

  if (!noReview) {
    const reviewStep = {
      key: 'commonWizardAutoReviewStep',
      title: reviewText,
      render: () => {
        const genSections = wizardMeta.steps.filter(
          s => s.key !== 'commonWizardAutoReviewStep' && !s.noReview,
        );
        const headerSections = wizardMeta.reviewHeaders || [];
        const footerSections = wizardMeta.reviewFooters || [];
        const allSections = [...headerSections, ...genSections, ...footerSections];
        return allSections.map(s => {
          const reviewMeta = s.reviewMeta || s.formMeta || null;
          return (
            <section className="form-section" key={`section-${s.key || s.title}`}>
              {s.title && <h3>{s.title}</h3>}
              {s.renderReview
                ? s.renderReview(form)
                : reviewMeta && (
                    <NiceForm
                      meta={{
                        ...reviewMeta,
                        viewMode: true,
                        initialValues: form.getFieldsValue(true),
                      }}
                    />
                  )}
            </section>
          );
        });
      },
    };
    wizardMeta = {
      ...wizardMeta,
      steps: [...wizardMeta.steps, reviewStep],
    };
  }
  // Support to define a step that is only in review page.
  const filterredSteps = wizardMeta.steps.filter(s => !s.onlyReview);
  const stepsLength = filterredSteps.length;

  const handleSubmit = useCallback(
    evt => {
      evt.preventDefault();
      onSubmit(form.getFieldsValue(true));
    },
    [form, onSubmit],
  );
  const isLastStep = currentStep === stepsLength - 1;
  const isReview = !noReview && currentStep === stepsLength - 1;
  const stepMeta = filterredSteps[currentStep];

  return (
    <Form
      layout="horizontal"
      form={form}
      className={`common-wizard common-wizard-steps-${direction || 'horizontal'}`}
    >
      <Steps
        current={currentStep}
        orientation={direction}
        size={direction === 'vertical' ? 'small' : 'medium'}
        items={filterredSteps.map(s => ({
          key: s.key || s.title,
          title: s.title,
        }))}
      />
      <div className="common-wizard-content">
        {stepMeta.render ? (
          stepMeta.render(form)
        ) : (
          <NiceForm meta={{ ...stepMeta.formMeta, viewMode: isReview }} />
        )}
      </div>
      <Form.Item className="common-wizard-footer form-footer" style={{ textAlign: 'right' }}>
        {currentStep > 0 && (
          <Button className="btn-back" onClick={handleBack} disabled={pending}>
            Back
          </Button>
        )}
        <Button disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
        &nbsp; &nbsp;
        <Button
          type="primary"
          disabled={pending}
          loading={pending}
          onClick={isLastStep ? handleSubmit : handleNext}
        >
          {pending ? pendingText : isLastStep ? submitText : 'Next'}
        </Button>
      </Form.Item>
    </Form>
  );
}

// export default Form.create()(Wizard);
