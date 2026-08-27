import { useState } from 'react'
import SegmentedTabs from '../components/SegmentedTabs'
import AllRequests from './AllRequests'
import BrowseCraftsmen from './BrowseCraftsmen'

const Explore = ({ onOpenRequest, onOpenCraftsmanProfile }) => {
  const [tab, setTab] = useState('requests')

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4 pt-2">تصفح</h2>
      <SegmentedTabs
        tabs={[{ key: 'requests', label: 'كل الطلبات' }, { key: 'craftsmen', label: 'الحرفيون' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'requests' ? (
        <AllRequests onOpenRequest={onOpenRequest} />
      ) : (
        <BrowseCraftsmen onOpenCraftsmanProfile={onOpenCraftsmanProfile} />
      )}
    </div>
  )
}

export default Explore
