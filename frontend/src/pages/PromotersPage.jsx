import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import PromoterTable from '../components/PromoterTable';
import Pagination from '../components/Pagination';
import FullForm from '../components/FullForm';

const PromotersPage = () => {
  return (
    <div className="p-8 pt-3">
      {/* <FullForm /> */}
      <Header />
      <FilterBar />
      <PromoterTable />
      <Pagination />
    </div>
  );
};

export default PromotersPage;
