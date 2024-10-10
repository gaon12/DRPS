const regions = [
	"전국",
	"서울특별시",
	"부산광역시",
	"대구광역시",
	"인천광역시",
	"광주광역시",
	"대전광역시",
	"울산광역시",
	"세종특별자치시",
	"경기도",
	"강원특별자치도",
	"충청북도",
	"충청남도",
	"전북특별자치도",
	"전라남도",
	"경상북도",
	"경상남도",
	"제주특별자치도"
];

// 전국을 제외한 지역을 가나다순으로 정렬
const sortedRegions = ["전국", ...regions.filter(region => region !== "전국").sort()];

export default sortedRegions;
