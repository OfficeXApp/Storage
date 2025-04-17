import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  List,
  Tag,
  Space,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Card,
  Divider,
  Layout,
  Result,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";
import { wrapAuthStringOrHeader } from "../../api/helpers";
import { Content } from "antd/es/layout/layout";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  IResponseSearchDrive,
  SearchCategoryEnum,
  SearchDriveRequestBody,
  SearchResult,
  SearchResultResourceID,
  SearchSortByEnum,
  SortDirection,
} from "@officexapp/types";
import TagCopy from "../../components/TagCopy";

// Category tag color map
const getCategoryColor = (category: SearchCategoryEnum): string => {
  const colorMap: Record<SearchCategoryEnum, string> = {
    [SearchCategoryEnum.ALL]: "default",
    [SearchCategoryEnum.FILES]: "cyan",
    [SearchCategoryEnum.FOLDERS]: "blue",
    [SearchCategoryEnum.CONTACTS]: "green",
    [SearchCategoryEnum.DISKS]: "magenta",
    [SearchCategoryEnum.DRIVES]: "purple",
    [SearchCategoryEnum.GROUPS]: "gold",
  };
  return colorMap[category] || "default";
};

/**
 * SearchResultsPage Component
 * Displays a search interface with results in a list format
 */
const SearchResultsPage: React.FC = () => {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pageSize] = useState<number>(50);
  const { currentAPIKey, currentOrg, generateSignature, wrapOrgCode } =
    useIdentitySystem();
  const [reindexLoading, setReindexLoading] = useState<boolean>(false);

  // Parse URL query parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get("query");

    if (queryParam) {
      const decodedQuery = decodeURIComponent(queryParam);
      setSearchQuery(decodedQuery);
      // Auto-execute search if there's a query parameter
      executeSearch(decodedQuery);
    }
  }, [location.search]);

  // Handle search query change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter query change
  const handleFilterQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
  };

  // Filter results based on filter query
  useEffect(() => {
    if (!searchResults.length) return;

    if (!filterQuery.trim()) {
      setFilteredResults(searchResults);
      return;
    }

    const lowercaseFilter = filterQuery.toLowerCase();
    const filtered = searchResults.filter(
      (result) =>
        result.title.toLowerCase().includes(lowercaseFilter) ||
        result.preview.toLowerCase().includes(lowercaseFilter)
    );
    setFilteredResults(filtered);
  }, [filterQuery, searchResults]);

  // Update URL with the search query
  const updateUrlWithQuery = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    navigate(
      {
        pathname: location.pathname,
        search: `?query=${encodedQuery}`,
      },
      { replace: true }
    );
  };

  // Execute search with given query
  const executeSearch = async (query: string) => {
    if (!currentOrg) return;
    if (!query.trim()) {
      message.warning("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const requestBody: SearchDriveRequestBody = {
        query: query,
        // categories: [SearchCategoryEnum.ALL],
        // page_size: pageSize,
        // sort_by: SearchSortByEnum.RELEVANCE,
        // direction: SortDirection.DESC,
      };
      let auth_token = currentAPIKey?.value || (await generateSignature());
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/search`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data: IResponseSearchDrive = await response.json();

      if (data.ok.data) {
        setSearchResults(data.ok.data.items);
        setFilteredResults(data.ok.data.items);
        setTotalResults(data.ok.data.total);
        setCursor(data.ok.data.cursor);
      } else {
        throw new Error("Search request was not successful");
      }
    } catch (error) {
      console.error("Search error:", error);
      message.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  // Perform search and update URL
  const handleSearch = () => {
    updateUrlWithQuery(searchQuery);
    executeSearch(searchQuery);
  };

  // Load more results
  const loadMore = async () => {
    if (!cursor || loading || !currentOrg) return;

    setLoading(true);
    try {
      const requestBody: SearchDriveRequestBody = {
        query: searchQuery,
        // page_size: pageSize,
        // categories: [SearchCategoryEnum.ALL],
        // cursor: cursor,
        // sort_by: SearchSortByEnum.RELEVANCE,
        // direction: SortDirection.DESC,
      };

      let auth_token = currentAPIKey?.value || (await generateSignature());
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/search`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch more search results");
      }

      const data: IResponseSearchDrive = await response.json();

      if (data.ok.data) {
        const newResults = [...searchResults, ...data.ok.data.items];
        setSearchResults(newResults);

        // Apply current filter to the new combined results
        if (filterQuery.trim()) {
          const lowercaseFilter = filterQuery.toLowerCase();
          const filtered = newResults.filter(
            (result) =>
              result.title.toLowerCase().includes(lowercaseFilter) ||
              result.preview.toLowerCase().includes(lowercaseFilter)
          );
          setFilteredResults(filtered);
        } else {
          setFilteredResults(newResults);
        }

        setCursor(data.ok.data.cursor);
      } else {
        throw new Error("Search request was not successful");
      }
    } catch (error) {
      console.error("Load more error:", error);
      message.error("An error occurred while loading more results");
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReindex = async () => {
    if (!currentOrg) return;

    setReindexLoading(true);
    try {
      let auth_token = currentAPIKey?.value || (await generateSignature());
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/reindex`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          force: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reindex drive");
      }

      const data = await response.json();

      if (data.ok && data.ok.data) {
        const { indexed_count } = data.ok.data;
        message.success(
          `Drive reindexing started successfully! ${indexed_count} items indexed.`
        );
      } else {
        throw new Error("Reindex request was not successful");
      }
    } catch (error) {
      console.error("Reindex error:", error);
      message.error("An error occurred while reindexing the drive");
    } finally {
      setReindexLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 32px", gap: 16 }}>
        <Typography.Title level={3}>Search Results</Typography.Title>

        {/* Main Search Bar */}
        <div style={{ marginBottom: "24px" }}>
          <Input.Group compact>
            <Input
              placeholder="Search for files, folders, contacts, etc."
              value={searchQuery}
              onChange={handleSearchQueryChange}
              size="large"
              onPressEnter={handleSearch}
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: "calc(100% - 100px)" }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{ width: "100px" }}
              loading={loading}
            >
              Search
            </Button>
          </Input.Group>
        </div>

        {/* Filter Results */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space direction="horizontal">
              <Input
                placeholder="Filter by title or content"
                prefix={<FilterOutlined />}
                value={filterQuery}
                onChange={handleFilterQueryChange}
                style={{ width: "300px", maxWidth: "300px" }}
              />

              <Typography.Text style={{ marginLeft: "16px" }}>
                Showing {filteredResults.length} of {totalResults} results
              </Typography.Text>
            </Space>
            <Popconfirm
              title="Reindexing the drive will allow new items to be searchable."
              onConfirm={handleReindex}
              okText="Proceed"
            >
              <Button icon={<SyncOutlined />}>Reindex Drive</Button>
            </Popconfirm>
          </div>
        )}

        {/* Results List */}
        <div style={{ minHeight: "70vh" }}>
          {loading && !searchResults.length ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <Typography.Paragraph style={{ marginTop: "16px" }}>
                Searching...
              </Typography.Paragraph>
            </div>
          ) : searchResults.length === 0 ? (
            <Result
              status="info"
              icon={
                <FileSearchOutlined
                  style={{ fontSize: 72, color: "#1890ff" }}
                />
              }
              title="No Results Found"
              subTitle="You might need to reindex your drive to get latest results. Click below to reindex."
              extra={
                <Button
                  type="primary"
                  onClick={handleReindex}
                  loading={reindexLoading}
                >
                  Reindex Drive
                </Button>
              }
            />
          ) : (
            <List
              itemLayout="vertical"
              size="large"
              dataSource={filteredResults}
              renderItem={(item) => {
                let urlLink = "";
                if (item.resource_id.startsWith("FileID_")) {
                  urlLink = wrapOrgCode(`/drive${item.metadata}`);
                } else if (item.resource_id.startsWith("FolderID_")) {
                  urlLink = wrapOrgCode(`/drive${item.metadata}`);
                } else if (item.resource_id.startsWith("ContactID_")) {
                  urlLink = wrapOrgCode(
                    `/resources/contacts/${item.resource_id}`
                  );
                } else if (item.resource_id.startsWith("LabelID_")) {
                  urlLink = wrapOrgCode(
                    `/resources/labels/${item.resource_id}`
                  );
                } else if (item.resource_id.startsWith("GroupID_")) {
                  urlLink = wrapOrgCode(
                    `/resources/groups/${item.resource_id}`
                  );
                } else if (item.resource_id.startsWith("DiskID_")) {
                  urlLink = wrapOrgCode(`/resources/disks/${item.resource_id}`);
                } else if (item.resource_id.startsWith("DriveID_")) {
                  urlLink = wrapOrgCode(
                    `/resources/drives/${item.resource_id}`
                  );
                }
                return (
                  <Link to={urlLink}>
                    <List.Item
                      key={`${item.resource_id}`}
                      style={{
                        border: "1px solid #e8e8e8",
                        margin: 0,
                        cursor: "pointer",
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Typography.Text strong>
                            <Tag
                              color={getCategoryColor(item.category)}
                              style={{
                                width: "100px",
                                textAlign: "center",
                                marginRight: "24px",
                              }}
                            >
                              {item.category.replace("_", " ")}
                            </Tag>
                            {item.title} <TagCopy id={item.resource_id} />{" "}
                          </Typography.Text>
                        }
                        description={
                          <Space direction="horizontal">
                            <div
                              style={{
                                width: "100px",
                                textAlign: "center",
                                marginRight: "18px",
                              }}
                            ></div>
                            <Typography.Text type="secondary">
                              {item.preview}
                            </Typography.Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  </Link>
                );
              }}
              pagination={
                totalResults > searchResults.length && cursor
                  ? {
                      onChange: () => loadMore(),
                      total: totalResults,
                      showSizeChanger: false,
                      pageSize: pageSize,
                      showTotal: (total) => `Total ${total} items`,
                    }
                  : false
              }
              locale={{
                emptyText: "No results found",
              }}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default SearchResultsPage;
