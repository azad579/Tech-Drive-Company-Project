import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { SalesInvoiceCreateView } from './views/SalesInvoiceCreateView';
import { ProductListView } from './views/ProductListView';
import { PurchaseInvoiceView } from './views/PurchaseInvoiceView';
import { ChequeManagementView } from './views/ChequeManagementView';
import { DailyExpensesView } from './views/DailyExpensesView';
import { ClientSetupView } from './views/ClientSetupView';
import { ReportsView } from './views/ReportsView';
import { DatabaseBackupView } from './views/DatabaseBackupView';
import { GenericModuleView } from './views/GenericModuleView';
import { UserRoleListView } from './views/UserRoleListView';
import { RoleCreateView } from './views/RoleCreateView';
import { UserListView } from './views/UserListView';
import { UserCreateView } from './views/UserCreateView';
import { ReportRoleCreateView } from './views/ReportRoleCreateView';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProfileModal } from './views/ProfileModal';
import { FloatingWidgets } from './components/FloatingWidgets';
import { PersonalView } from './views/PersonalView';
import { BankModuleView } from './views/BankModuleView';
import { PayrollModuleView } from './views/PayrollModuleView';
import { FinancialsModuleView } from './views/FinancialsModuleView';
import { AdvancedReportsView } from './views/AdvancedReportsView';
import { PriceListView } from './views/PriceListView';
import { LoanManagementView } from './views/LoanManagementView';
import { SalesQuotationView } from './views/SalesQuotationView';
import { SalesEstimateView } from './views/SalesEstimateView';
import { SalesInvoiceListView } from './views/SalesInvoiceListView';
import { ServiceView } from './views/ServiceView';
import { WarrantyView } from './views/WarrantyView';
import { InventoryModuleView } from './views/InventoryModuleView';
import { MasterSetupView } from './views/MasterSetupView';
import { AccountsSetupView } from './views/AccountsSetupView';
import { ERP_MENU_TREE } from './data/fullMenuData';

const MainLayout: React.FC = () => {
  const { user, currentRoute, activeModuleTitle } = useApp();

  if (!user.isLoggedIn) {
    return <LoginView />;
  }

  // Find category name and title from menu tree
  let categoryName = 'General';
  let resolvedTitle = activeModuleTitle;

  for (const cat of ERP_MENU_TREE) {
    if (cat.href === currentRoute) {
      categoryName = cat.title;
      resolvedTitle = cat.title;
      break;
    }
    const foundSub = cat.subItems.find(s => s.href === currentRoute);
    if (foundSub) {
      categoryName = cat.title;
      resolvedTitle = foundSub.title;
      break;
    }
  }

  const renderCurrentView = () => {
    // 1. Dashboard
    if (currentRoute === 'home.php' || currentRoute === '' || currentRoute === '#') {
      return <DashboardView />;
    }

    // 2. Sales Quotations
    if (currentRoute === 'sel_squolist.php' || currentRoute === 'sel_quotationlist.php') {
      return <SalesQuotationView initialCreateMode={false} />;
    }
    if (currentRoute === 'sel_squocreate.php' || currentRoute === 'sel_quotationcreate.php') {
      return <SalesQuotationView initialCreateMode={true} />;
    }

    // 3. Sales Estimates
    if (currentRoute === 'sel_estlist.php' || currentRoute === 'sel_sestimatelist.php') {
      return <SalesEstimateView initialCreateMode={false} />;
    }
    if (currentRoute === 'sel_estcreate.php' || currentRoute === 'sel_sestimatecteate.php') {
      return <SalesEstimateView initialCreateMode={true} />;
    }

    // 4. Sales POS & Invoices & Returns
    if (currentRoute === 'sel_sinvcteate.php') {
      return <SalesInvoiceCreateView />;
    }
    if (currentRoute === 'sel_sinvedit.php') {
      return <SalesInvoiceListView initialMode="edit" />;
    }
    if (currentRoute === 'sel_sreturncreate.php' || currentRoute === 'sel_sreturncteate.php') {
      return <SalesInvoiceListView initialMode="returnCreate" />;
    }
    if (currentRoute === 'sel_sreturnlist.php') {
      return <SalesInvoiceListView initialMode="returnList" />;
    }
    if (currentRoute === 'sel_sinvlist.php') {
      return <SalesInvoiceListView initialMode="list" />;
    }

    // 5. Service Management (ser_*)
    if (currentRoute === 'ser_servicelist.php') {
      return <ServiceView initialSubTab="list" />;
    }
    if (currentRoute === 'ser_sreclist.php' || currentRoute === 'ser_receivelist.php') {
      return <ServiceView initialSubTab="receivedList" />;
    }
    if (currentRoute === 'ser_sreccreate.php' || currentRoute === 'ser_receivecreate.php') {
      return <ServiceView initialSubTab="receivedCreate" />;
    }
    if (currentRoute === 'ser_sinvlist.php' || currentRoute === 'ser_serinvlist.php') {
      return <ServiceView initialSubTab="salesList" />;
    }
    if (currentRoute === 'ser_sinvcreate.php' || currentRoute === 'ser_serinvcre.php') {
      return <ServiceView initialSubTab="salesCreate" />;
    }
    if (currentRoute.startsWith('ser_')) {
      return <ServiceView initialSubTab="list" />;
    }

    // 6. Warranty Management (war_*)
    if (currentRoute === 'war_claimlist.php' || currentRoute === 'war_claim.php') {
      return <WarrantyView initialTab="claim" />;
    }
    if (currentRoute === 'war_checkinglist.php' || currentRoute === 'war_procheck.php') {
      return <WarrantyView initialTab="checking" />;
    }
    if (currentRoute === 'war_proclaimlist.php' || currentRoute === 'war_proreceiv.php') {
      return <WarrantyView initialTab="manage" />;
    }
    if (currentRoute === 'war_delreclist.php' || currentRoute === 'war_deliverd.php') {
      return <WarrantyView initialTab="delivered" />;
    }
    if (currentRoute === 'war_stock.php' || currentRoute === 'war_prostcok.php') {
      return <WarrantyView initialTab="stock" />;
    }
    if (
      currentRoute === 'war_badstockclaim.php' ||
      currentRoute === 'war_badclaimcreate.php' ||
      currentRoute === 'war_manbadstock.php'
    ) {
      return <WarrantyView initialTab="supplier" />;
    }
    if (currentRoute === 'war_servicecenter.php' || currentRoute === 'war_service.php') {
      return <WarrantyView initialTab="serviceCenter" />;
    }
    if (currentRoute.startsWith('war_')) {
      return <WarrantyView initialTab="claim" />;
    }

    // 7. Inventory Module (inv_*)
    if (
      currentRoute === 'inv_branchlist.php' ||
      currentRoute === 'inv_branch.php'
    ) {
      return <InventoryModuleView initialTab="branchList" />;
    }
    if (currentRoute === 'inv_branchcreate.php') {
      return <InventoryModuleView initialTab="branchCreate" />;
    }
    if (
      currentRoute === 'inv_whouselist.php' ||
      currentRoute === 'inv_warehouse.php' ||
      currentRoute === 'inv_warehouselist.php'
    ) {
      return <InventoryModuleView initialTab="warehouseList" />;
    }
    if (
      currentRoute === 'inv_whousecreate.php' ||
      currentRoute === 'inv_warehousecreate.php'
    ) {
      return <InventoryModuleView initialTab="warehouseCreate" />;
    }
    if (
      currentRoute === 'inv_deliverlist.php' ||
      currentRoute === 'inv_sdeliverylist.php'
    ) {
      return <InventoryModuleView initialTab="salesDelivery" />;
    }
    if (
      currentRoute === 'inv_sdeliverycreate.php' ||
      currentRoute === 'inv_delivercreate.php'
    ) {
      return <InventoryModuleView initialTab="salesDeliveryCreate" />;
    }
    if (
      currentRoute === 'inv_receivlist.php' ||
      currentRoute === 'inv_preceivelist.php'
    ) {
      return <InventoryModuleView initialTab="purchaseReceive" />;
    }
    if (
      currentRoute === 'inv_preceivecreate.php' ||
      currentRoute === 'inv_receivcreate.php'
    ) {
      return <InventoryModuleView initialTab="purchaseReceiveCreate" />;
    }
    if (
      currentRoute === 'inv_brstocklist.php' ||
      currentRoute === 'inv_branchstock.php'
    ) {
      return <InventoryModuleView initialTab="branchStock" />;
    }
    if (
      currentRoute === 'inv_whostock.php' ||
      currentRoute === 'inv_warehousestock.php'
    ) {
      return <InventoryModuleView initialTab="warehouseStock" />;
    }
    if (
      currentRoute === 'inv_comstock.php' ||
      currentRoute === 'inv_allstock.php'
    ) {
      return <InventoryModuleView initialTab="combinedStock" />;
    }
    if (
      currentRoute === 'inv_bratra.php' ||
      currentRoute === 'inv_btransferlist.php'
    ) {
      return <InventoryModuleView initialTab="branchTransfer" />;
    }
    if (currentRoute === 'inv_btransfercreate.php') {
      return <InventoryModuleView initialTab="branchTransferCreate" />;
    }
    if (
      currentRoute === 'inv_whotra.php' ||
      currentRoute === 'inv_wtransferlist.php'
    ) {
      return <InventoryModuleView initialTab="warehouseTransfer" />;
    }
    if (currentRoute === 'inv_wtransfercreate.php') {
      return <InventoryModuleView initialTab="warehouseTransferCreate" />;
    }
    if (
      currentRoute === 'inv_prodispos.php' ||
      currentRoute === 'inv_disposallist.php'
    ) {
      return <InventoryModuleView initialTab="productDisposal" />;
    }
    if (
      currentRoute === 'inv_disposalcreate.php' ||
      currentRoute === 'inv_prodisposcreate.php'
    ) {
      return <InventoryModuleView initialTab="productDisposalCreate" />;
    }
    if (currentRoute.startsWith('inv_')) {
      return <InventoryModuleView initialTab="branchList" />;
    }

    // 4. Price List & Bulk Price Update (Daily Process)
    if (currentRoute === 'dai_pricelist.php') {
      return <PriceListView />;
    }
    if (currentRoute === 'dai_priceupdate.php') {
      return <PriceListView isBulkUpdate />;
    }

    // 5. Products & Catalog (pro_*)
    if (currentRoute.startsWith('pro_')) {
      return <ProductListView />;
    }

    // 6. Master Setup (mas_*)
    if (currentRoute.startsWith('mas_')) {
      return <MasterSetupView />;
    }

    // 7. Purchase (Order, Invoice, Return)
    if (currentRoute.startsWith('pur_')) {
      return <PurchaseInvoiceView />;
    }

    // 8. Accounts Setup (acc_*)
    if (currentRoute.startsWith('acc_')) {
      return <AccountsSetupView />;
    }

    // 9. Installment & Loan (lon_*)
    if (currentRoute.startsWith('lon_')) {
      return <LoanManagementView />;
    }

    // 9. Cheques & Banking (ban_*)
    if (
      currentRoute.startsWith('ban_') ||
      currentRoute === 'ban_checkman.php' ||
      currentRoute === 'ban_banklist.php' ||
      currentRoute === 'ban_bankcreate.php' ||
      currentRoute === 'ban_accountlist.php' ||
      currentRoute === 'ban_accountcreate.php' ||
      currentRoute === 'ban_mobileaccount.php' ||
      currentRoute === 'ban_bnktranlist.php' ||
      currentRoute === 'ban_bnkcreate.php'
    ) {
      return <BankModuleView />;
    }

    // 10. Payroll (payr_*)
    if (currentRoute.startsWith('payr_')) {
      return <PayrollModuleView />;
    }

    // 11. Personal (axe_note.php, axe_todo.php)
    if (currentRoute === 'axe_note.php' || currentRoute === 'axe_todo.php') {
      return <PersonalView />;
    }

    // 12. Expenses
    if (
      currentRoute === 'dai_expenlist.php' ||
      currentRoute === 'dai_expensescreate.php' ||
      currentRoute === 'dai_esexpenlist.php' ||
      currentRoute === 'dai_explist.php'
    ) {
      return <DailyExpensesView />;
    }

    // 13. Clients (Customers, Suppliers, Groups, SMS)
    if (currentRoute === 'main_cutomerlist.php') {
      return <ClientSetupView initialSubTab="customerList" />;
    }
    if (currentRoute === 'main_cutomercreate.php') {
      return <ClientSetupView initialSubTab="customerCreate" />;
    }
    if (
      currentRoute === 'main_supplierlist.php' ||
      currentRoute === 'main_sellerlist.php'
    ) {
      return <ClientSetupView initialSubTab="supplierList" />;
    }
    if (currentRoute === 'main_suppliercreate.php') {
      return <ClientSetupView initialSubTab="supplierCreate" />;
    }
    if (currentRoute === 'main_grouplist.php') {
      return <ClientSetupView initialSubTab="groupList" />;
    }
    if (currentRoute === 'main_groupcreate.php') {
      return <ClientSetupView initialSubTab="groupCreate" />;
    }
    if (currentRoute === 'main_promsms.php') {
      return <ClientSetupView initialSubTab="promoSms" />;
    }
    if (currentRoute === 'main_indpromsms.php') {
      return <ClientSetupView initialSubTab="indivSms" />;
    }
    if (currentRoute.startsWith('main_')) {
      return <ClientSetupView />;
    }

    // 14. Financials Module (fin_*)
    if (currentRoute.startsWith('fin_')) {
      return <FinancialsModuleView />;
    }

    // 15. Reports & Financial Statements
    if (
      currentRoute === 'axe_report.php' ||
      currentRoute.startsWith('rep_')
    ) {
      return <AdvancedReportsView />;
    }

    // 10. Database Backup (supporting all aliases and filenames)
    if (
      currentRoute === 'axe_databasebackup.php' ||
      currentRoute === 'dai_backup.php' ||
      currentRoute === 'sys_backup.php' ||
      currentRoute === 'sys_dbbackup.php'
    ) {
      return <DatabaseBackupView />;
    }

    // 11. User & Role Module
    if (currentRoute === 'rou_rolelist.php' || currentRoute === 'usr_rolelist.php') {
      return <UserRoleListView />;
    }
    if (currentRoute === 'rou_rolecreate.php' || currentRoute === 'usr_addrole.php') {
      return <RoleCreateView />;
    }
    if (currentRoute === 'rou_userlist.php' || currentRoute === 'usr_alluser.php') {
      return <UserListView />;
    }
    if (currentRoute === 'rou_usercreate.php' || currentRoute === 'usr_adduser.php') {
      return <UserCreateView />;
    }
    if (currentRoute === 'rou_reprolecreate.php' || currentRoute === 'usr_reportrole.php') {
      return <ReportRoleCreateView />;
    }

    // 12. Generic Module Engine for all other 161 ERP submenus
    return (
      <GenericModuleView
        title={resolvedTitle}
        categoryName={categoryName}
        href={currentRoute}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ecf0f5]">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2.5 px-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between no-print select-none">
        <div>
          <strong className="text-gray-700">Copyright &copy; 2026 </strong>
          <span className="font-semibold text-[#0084bf]">Tech Drive ERP</span>. All rights reserved.
        </div>
        <div className="text-[11px] text-gray-400 mt-1 sm:mt-0">
          Powered by Axes Business Automation (BGD ERP V1.0)
        </div>
      </footer>

      {/* Floating UI Drawers & Modals */}
      <FloatingWidgets />
      <InvoicePrintModal />
      <ProductDetailModal />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
