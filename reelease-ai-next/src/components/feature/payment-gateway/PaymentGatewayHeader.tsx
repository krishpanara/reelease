'use client'

import { PaymentGatewayHeaderProps } from "@/types/paymentGateway"
import { useTranslation } from "react-i18next"



const PaymentGatewayHeader = ({ isLoading, onRefresh }: PaymentGatewayHeaderProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold title-color">
            {t("gateway_title", { defaultValue: 'Payment Setup' })}
          </h1>

        </div>
      </div>
    </div>
  )
}

export default PaymentGatewayHeader
