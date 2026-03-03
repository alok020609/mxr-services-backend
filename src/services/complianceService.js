const prisma = require('../config/database');
const logger = require('../utils/logger');

class ComplianceService {
  // CCPA compliance - Data export
  static async exportUserData(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
          },
        },
        reviews: true,
        wishlist: true,
      },
    });

    return {
      personalInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      addresses: user.addresses,
      orders: user.orders,
      reviews: user.reviews,
      wishlist: user.wishlist,
      exportedAt: new Date(),
    };
  }

  // CCPA compliance - Right to deletion
  static async deleteUserData(userId) {
    // Anonymize user data instead of hard delete (for order history, etc.)
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: 'Deleted User',
        email: `deleted_${userId}@deleted.com`,
        phone: null,
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  // PCI DSS checklist
  static async getPCIComplianceStatus() {
    // TODO: Implement actual PCI DSS compliance checking
    return {
      compliant: true,
      checklist: {
        secureNetwork: true,
        protectCardholderData: true,
        maintainVulnerabilityManagement: true,
        implementStrongAccessControl: true,
        monitorAndTestNetworks: true,
        maintainInformationSecurityPolicy: true,
      },
      lastAudit: new Date(),
    };
  }

  // Tax compliance - Avalara/TaxJar integration
  static async calculateTaxWithAvalara(orderData) {
    // TODO: Implement Avalara API integration
    return {
      taxAmount: orderData.subtotal * 0.08, // Placeholder
      taxRate: 0.08,
      jurisdiction: 'US-CA',
    };
  }

  static async calculateTaxWithTaxJar(orderData) {
    // TODO: Implement TaxJar API integration
    return {
      taxAmount: orderData.subtotal * 0.08, // Placeholder
      taxRate: 0.08,
      jurisdiction: 'US-CA',
    };
  }

  // EU VAT MOSS
  static async calculateVATMOSS(orderData, country) {
    // TODO: Implement EU VAT MOSS calculation
    const vatRates = {
      DE: 0.19,
      FR: 0.20,
      IT: 0.22,
      ES: 0.21,
    };

    const vatRate = vatRates[country] || 0.20;
    return {
      vatAmount: orderData.subtotal * vatRate,
      vatRate,
      country,
    };
  }

  // GST compliance
  static async calculateGST(orderData, country) {
    // TODO: Implement GST calculation for India, Australia, etc.
    if (country === 'IN') {
      return {
        gstAmount: orderData.subtotal * 0.18,
        gstRate: 0.18,
        cgst: orderData.subtotal * 0.09,
        sgst: orderData.subtotal * 0.09,
      };
    }
    return { gstAmount: 0, gstRate: 0 };
  }

  // Sales tax nexus tracking
  static async trackNexus(country, state, city) {
    const nexus = await prisma.taxNexus.findFirst({
      where: {
        country,
        state,
        city,
      },
    });

    if (!nexus) {
      return await prisma.taxNexus.create({
        data: {
          country,
          state,
          city,
          isActive: true,
        },
      });
    }

    return nexus;
  }

  // Terms of service / Privacy policy management
  static async createLegalDocument(type, content, version) {
    const document = await prisma.legalDocument.create({
      data: {
        type, // TERMS_OF_SERVICE, PRIVACY_POLICY, RETURN_POLICY, COOKIE_POLICY
        content,
        version: version || '1.0',
        isActive: true,
        effectiveDate: new Date(),
      },
    });

    return document;
  }

  static async getActiveLegalDocument(type) {
    const document = await prisma.legalDocument.findFirst({
      where: {
        type,
        isActive: true,
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return document;
  }

  // User acceptance tracking
  static async recordUserAcceptance(userId, documentType, documentVersion) {
    const acceptance = await prisma.userAcceptance.create({
      data: {
        userId,
        documentType,
        documentVersion,
        acceptedAt: new Date(),
        ipAddress: null, // Should be passed from request
      },
    });

    return acceptance;
  }

  static async checkUserAcceptance(userId, documentType) {
    const document = await this.getActiveLegalDocument(documentType);
    if (!document) {
      return { accepted: false, required: false };
    }

    const acceptance = await prisma.userAcceptance.findFirst({
      where: {
        userId,
        documentType,
        documentVersion: document.version,
      },
    });

    return {
      accepted: !!acceptance,
      required: true,
      currentVersion: document.version,
      acceptedVersion: acceptance?.documentVersion,
    };
  }
}

module.exports = { ComplianceService };


