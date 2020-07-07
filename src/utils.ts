import {Subscription} from "react-native-iap";

import {MethodParametersRequiredException} from "./exceptions/MethodParametersRequiredException";

import {EPeriodType} from "./declarations/enums/EPeriodType";
import {EIapHubIntroductoryPaymentType} from "./declarations/enums/EIapHubIntroductoryPaymentType";
import {EIapHubSubscriptionPeriod} from "./declarations/enums/EIapHubSubscriptionPeriod";

class IapHubUtilsClass {
    IsUndefined(Value: any): Value is undefined {
        return typeof Value === 'undefined';
    }

    IsString(Value: any): Value is string {
        return typeof Value === 'string';
    }

    IsNull(Value: any): Value is null {
        return Value === null;
    }

    IsNumber(Value: any): Value is number {
        return typeof Value === 'number';
    }

    IsFunction(Target: any): Target is Function {
        return typeof Target === 'function';
    }

    IsValueExistsInEnum<EnumType>(Enum: EnumType, Value: any) {
        return Object.values(Enum).includes(Value);
    }

    ConvertToISO8601(NumberOfPeriods: string, PeriodType: EPeriodType): string {
        if ( !IapHubUtils.IsNumber(NumberOfPeriods) || !IapHubUtils.IsValueExistsInEnum(EPeriodType, PeriodType)) {
            throw new MethodParametersRequiredException('ConvertToISO8601', ['NumberOfPeriods', 'PeriodType']);
        }

        const BaseText = `P${NumberOfPeriods}`;

        switch(PeriodType) {
            case EPeriodType.DAY:
                return BaseText + 'D';
            case EPeriodType.WEEK:
                return BaseText + 'W';
            case EPeriodType.MONTH:
                return BaseText + 'M';
            case EPeriodType.YEAR:
                return BaseText + 'Y';
        }
    }

    ConvertIntroductoryPriceToFloat(IntroductoryPrice: string | undefined): number | undefined {
        if( this.IsUndefined(IntroductoryPrice) ) {
            return undefined;
        }

        const Matches = IntroductoryPrice.match(/\b\d+(?:.\d+)?/);

        if( Matches === null || Matches.length === 0 ) {
            return undefined;
        }

        return parseFloat(Matches[0]);
    }

    GetSubscriptionDurationForIos(ProductInfo: Subscription): EIapHubSubscriptionPeriod | undefined {
        return this.ConvertToISO8601(
            ProductInfo.subscriptionPeriodNumberIOS!,
            ProductInfo.subscriptionPeriodUnitIOS as EPeriodType
        ) as EIapHubSubscriptionPeriod;
    }

    GetSubscriptionTrialDurationForIos(ProductInfo: Subscription) {
        return this.ConvertToISO8601(
            ProductInfo.introductoryPriceNumberOfPeriodsIOS!,
            ProductInfo.introductoryPriceSubscriptionPeriodIOS as EPeriodType
        ) as EIapHubSubscriptionPeriod;
    }

    GetSubscriptionIntroDurationForIos(PaymentType: EIapHubIntroductoryPaymentType, ProductInfo: Subscription): EIapHubSubscriptionPeriod | undefined {
        switch (PaymentType) {
            case EIapHubIntroductoryPaymentType.AS_YOU_GO:
                return this.ConvertToISO8601(
                    ProductInfo.introductoryPriceNumberOfPeriodsIOS!,
                    ProductInfo.introductoryPriceSubscriptionPeriodIOS as EPeriodType
                ) as EIapHubSubscriptionPeriod;
            case EIapHubIntroductoryPaymentType.UPFRONT:
                return this.ConvertToISO8601(
                    ProductInfo.subscriptionPeriodNumberIOS!,
                    ProductInfo.subscriptionPeriodUnitIOS as EPeriodType
                ) as EIapHubSubscriptionPeriod;
        }
    }
}

export const IapHubUtils = new IapHubUtilsClass();