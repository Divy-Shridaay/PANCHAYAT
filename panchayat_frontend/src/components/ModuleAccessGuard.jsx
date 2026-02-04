
import { useEffect, useState } from "react";
import { useApiFetch } from "../utils/api";
import { useToast, Spinner, Center } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PaymentPopup from "./PaymentPopup";

export default function ModuleAccessGuard({ children, moduleName }) {
    const apiFetch = useApiFetch();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const { response, data } = await apiFetch("/api/register/user/status");
                if (response.ok) {
                    const moduleAccess = data?.user?.modulesAccess?.[moduleName] ?? false;
                    const isPending = data?.user?.pendingModules?.[moduleName] ?? false;
                    setIsSubscriptionExpired(data?.isSubscriptionExpired);

                    if (moduleAccess) {
                        setAllowed(true);
                    } else if (isPending) {
                        toast({
                            title: "ચકાસણી પેન્ડિંગ",
                            description: "તમારી આ મોડ્યુલની ચુકવણી હાલમાં ચકાસણી હેઠળ છે. કૃપા કરીને એડમિન દ્વારા પુષ્ટિ થાય ત્યાં સુધી રાહ જુઓ.",
                            status: "info",
                            duration: 5000,
                            isClosable: true,
                            position: "top",
                        });
                        navigate("/dashboard");
                    } else {
                        setShowPopup(true);
                    }
                } else {
                    console.error("Failed to fetch user status");
                    // If status fetch fails, arguably we should deny access or let it fail gracefully.
                    // Safer to deny and redirect.
                    navigate("/dashboard");
                }
            } catch (error) {
                console.error(error);
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        }
        checkAccess();
    }, [apiFetch, moduleName, navigate, toast]);

    if (loading) return <Center h="100vh"><Spinner size="xl" color="green.500" /></Center>;

    if (showPopup) {
        // onClose handles the case where the user clicks the 'X' button or overlay.
        // Buttons inside PaymentPopup handle their own navigation which will override this if sequential.
        // However, PaymentPopup calls onClose() first then navigates.
        // To avoid conflict, we can make onClose strictly "Go back to dashboard" which is what 'X' should do.
        return (
            <PaymentPopup
                isOpen={true}
                onClose={() => navigate("/dashboard")}
                type="module"
                isSubscriptionExpired={isSubscriptionExpired}
            />
        );
    }

    if (!allowed) return null;

    return children;
}
