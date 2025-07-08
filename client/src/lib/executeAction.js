import { isRedirectError } from "next/dist/client/components/redirect-error";

const executeAction = async ({
  actionFn,
  successMessage = "The actions was successful",
}) => {
  try {
    await actionFn();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: "An error has occurred during executing the action",
    };
  }
};

export { executeAction };